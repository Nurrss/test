// Usage: node --env-file=.env scripts/create-test-students.mjs
// Creates 10 students in the same class (group_name) for end-to-end testing.
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('run with `node --env-file=.env`')

const supabase = createClient(url, key, { auth: { persistSession: false } })

const GROUP = '6А'
const PASSWORD = 'Student2026!'

const students = [
  { full_name: 'Асан Ахметов', phone: '+7 701 000 00 01' },
  { full_name: 'Дана Серикова', phone: '+7 701 000 00 02' },
  { full_name: 'Ерлан Жумабеков', phone: '+7 701 000 00 03' },
  { full_name: 'Айгерим Нурланова', phone: '+7 701 000 00 04' },
  { full_name: 'Тимур Қасымов', phone: '+7 701 000 00 05' },
  { full_name: 'Аружан Бекова', phone: '+7 701 000 00 06' },
  { full_name: 'Нурлан Оспанов', phone: '+7 701 000 00 07' },
  { full_name: 'Гульнара Садықова', phone: '+7 701 000 00 08' },
  { full_name: 'Бекзат Төлеуов', phone: '+7 701 000 00 09' },
  { full_name: 'Жанна Абенова', phone: '+7 701 000 00 10' },
]

const created = []

for (const s of students) {
  const digits = s.phone.replace(/\D/g, '')
  const email = `${digits}@students.local`

  const { data: userRes, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  })

  if (createError) {
    console.error(`FAILED auth for ${s.full_name}: ${createError.message}`)
    continue
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userRes.user.id,
    role: 'student',
    full_name: s.full_name,
    phone: s.phone,
    group_name: GROUP,
    password_plain: PASSWORD,
  })

  if (profileError) {
    console.error(`FAILED profile for ${s.full_name}: ${profileError.message}`)
    await supabase.auth.admin.deleteUser(userRes.user.id)
    continue
  }

  console.log(`created ${s.full_name} (${s.phone}) id=${userRes.user.id}`)
  created.push({ id: userRes.user.id, full_name: s.full_name, phone: s.phone })
}

console.log(`\n${created.length}/${students.length} students created in group "${GROUP}", password: ${PASSWORD}`)
console.log(JSON.stringify(created, null, 2))
