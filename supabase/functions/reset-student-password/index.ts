// Edge Function: reset-student-password
// Деплоится через Supabase Dashboard → Edge Functions → Via Editor (эта копия — для
// истории/повторного деплоя, в репозитории не собирается и не запускается).
//
// Мұғалім оқушының құпия сөзін ауыстырады (ұмытып қалса) немесе бастапқы
// тіркеуден кейін (create-student) сақталмаған ескі аккаунттар үшін бірінші рет
// орнатады. auth.users паролін тек Admin API арқылы ғана өзгертуге болады —
// сондықтан бұл да Postgres RPC емес, Edge Function.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Кіру талап етіледі' }, 401)
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
    return jsonResponse({ error: 'Сессия жарамсыз' }, 401)
  }

  // Admin-клиент с service role — обходит RLS, только для проверки роли и сброса.
  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'teacher') {
    return jsonResponse({ error: 'Тек мұғалім құпия сөзді ауыстыра алады' }, 403)
  }

  const { student_id, new_password } = await req.json()

  if (!student_id || !new_password) {
    return jsonResponse({ error: 'Оқушы және жаңа құпия сөз міндетті' }, 400)
  }

  const { data: studentProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', student_id)
    .single()

  if (studentProfile?.role !== 'student') {
    return jsonResponse({ error: 'Оқушы табылмады' }, 404)
  }

  const { error: authError } = await adminClient.auth.admin.updateUserById(student_id, {
    password: new_password,
  })

  if (authError) {
    return jsonResponse({ error: authError.message }, 400)
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ password_plain: new_password })
    .eq('id', student_id)

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 400)
  }

  return jsonResponse({ ok: true }, 200)
})
