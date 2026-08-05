// Edge Function: create-student
// Деплоится через Supabase Dashboard → Edge Functions → Via Editor (эта копия — для
// истории/повторного деплоя, в репозитории не собирается и не запускается).
//
// Единственное место, где нужен service role key (Admin API для создания auth-
// пользователя-ученика) — поэтому это Edge Function, а не Postgres RPC: auth.users
// нельзя наполнять напрямую SQL-инсертом, только через GoTrue Admin API.

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Кіру талап етіледі' }), { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Клиент от имени вызывающего — чтобы узнать, кто он и что он учитель.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Сессия жарамсыз' }), { status: 401 })
  }

  // Admin-клиент с service role — обходит RLS, только для проверки роли и создания.
  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'teacher') {
    return new Response(JSON.stringify({ error: 'Тек мұғалім оқушы қоса алады' }), { status: 403 })
  }

  const { full_name, phone, group_name, password } = await req.json()

  if (!full_name || !phone || !password) {
    return new Response(JSON.stringify({ error: 'Аты-жөні, телефон және құпия сөз міндетті' }), {
      status: 400,
    })
  }

  // Синтетический email из телефона — та же логика, что studentEmailFromPhone()
  // в src/stores/auth.js, чтобы вход по телефону продолжал работать без изменений.
  const digits = String(phone).replace(/\D/g, '')
  const email = `${digits}@students.local`

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !created?.user) {
    return new Response(JSON.stringify({ error: createError?.message || 'Тіркеу сәтсіз аяқталды' }), {
      status: 400,
    })
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: created.user.id,
    role: 'student',
    full_name,
    phone,
    group_name: group_name || null,
  })

  if (profileError) {
    // Профиль сақталмаса — auth-аккаунтты да қалдырмаймыз (жетім жазба болмасын).
    await adminClient.auth.admin.deleteUser(created.user.id)
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ id: created.user.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
