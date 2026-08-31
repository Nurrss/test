import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CONTENT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
}

function contentTypeFor(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function getClient() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run with `node --env-file=.env`)')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// ---------- question builders ----------
// Each returns a plain spec object consumed by runImport(); `image`/`audio`
// are LOCAL FILE PATHS (or null) — runImport uploads them and rewrites to
// public URLs. `correct` is the id of the right option for choice-based
// types; for true_false use 'true'/'false'.

export function mc({ text, image = null, audio = null, options, correct, points = 1 }) {
  return {
    question_type: 'multiple_choice',
    points,
    image,
    audio,
    content: { text, options },
    correctAnswer: correct,
  }
}

export function tf({ text, statement = null, image = null, audio = null, correct, points = 1 }) {
  return {
    question_type: 'true_false',
    points,
    image,
    audio,
    content: {
      text,
      ...(statement ? { statement } : {}),
      options: [
        { id: 'true', label: 'Correct' },
        { id: 'false', label: 'Incorrect' },
      ],
    },
    correctAnswer: correct ? 'true' : 'false',
  }
}

// options: [{ id, label, image }] — image is a local path, uploaded per-option.
export function matching({ text, audio = null, options, correct, points = 1 }) {
  return {
    question_type: 'matching',
    points,
    image: null,
    audio,
    content: { text, options },
    correctAnswer: correct,
    optionImages: true,
  }
}

// Always manual-graded: the schema's auto-grading is exact jsonb equality,
// too fragile for free-text reading-comprehension answers (see project notes).
export function shortAnswer({ text, image = null, audio = null, placeholder = null, points = 1 }) {
  return {
    question_type: 'short_answer',
    points,
    image,
    audio,
    content: { text, ...(placeholder ? { placeholder } : {}) },
    requiresManual: true,
  }
}

export function openText({ text, image = null, placeholder = null, points = 10 }) {
  return {
    question_type: 'open_text',
    points,
    image,
    audio: null,
    content: { text, ...(placeholder ? { placeholder } : {}) },
    requiresManual: true,
  }
}

export function audioResponse({ text, image = null, points = 10 }) {
  return {
    question_type: 'audio_response',
    points,
    image,
    audio: null,
    content: { text },
    requiresManual: true,
  }
}

// ---------- import runner ----------

export async function runImport(spec) {
  const supabase = getClient()
  const uploadCache = new Map() // local path -> public URL, dedupes shared part-audio & reused images

  async function uploadOnce(bucket, localPath) {
    if (uploadCache.has(localPath)) return uploadCache.get(localPath)
    const buffer = await readFile(localPath)
    const remotePath = `${spec.id}/${path.basename(localPath).replace(/\s+/g, '_')}`
    const { error } = await supabase.storage
      .from(bucket)
      .upload(remotePath, buffer, { contentType: contentTypeFor(localPath), upsert: true })
    if (error) throw new Error(`upload failed (${localPath}): ${error.message}`)
    const { data } = supabase.storage.from(bucket).getPublicUrl(remotePath)
    uploadCache.set(localPath, data.publicUrl)
    return data.publicUrl
  }

  console.log(`[${spec.name}] creating variant row ${spec.id}`)
  const { error: variantError } = await supabase.from('exam_variants').upsert({
    id: spec.id,
    name: spec.name,
    level: spec.level,
    listening_time_limit_sec: spec.timeLimits?.listening ?? 900,
    reading_time_limit_sec: spec.timeLimits?.reading ?? 1200,
    writing_time_limit_sec: spec.timeLimits?.writing ?? 900,
    speaking_time_limit_sec: spec.timeLimits?.speaking ?? 420,
    is_active: spec.isActive ?? false,
  })
  if (variantError) throw new Error(`variant insert failed: ${variantError.message}`)

  const questionRows = []
  const answerRows = []

  for (const section of ['listening', 'reading', 'writing', 'speaking']) {
    const items = spec.sections[section] || []
    for (let i = 0; i < items.length; i++) {
      const q = items[i]
      const id = crypto.randomUUID()
      const orderIndex = i + 1

      let mediaUrl = null
      if (q.audio) mediaUrl = await uploadOnce('listening-audio', q.audio)

      const content = { ...q.content }
      if (q.image) content.image_url = await uploadOnce('question-images', q.image)

      if (q.optionImages) {
        content.options = await Promise.all(
          content.options.map(async (opt) => ({
            id: opt.id,
            label: opt.label,
            ...(opt.image ? { image_url: await uploadOnce('question-images', opt.image) } : {}),
          }))
        )
      }

      questionRows.push({
        id,
        variant_id: spec.id,
        section,
        order_index: orderIndex,
        question_type: q.question_type,
        content,
        media_url: mediaUrl,
        max_points: q.points,
        requires_manual_grading: Boolean(q.requiresManual),
      })

      if (!q.requiresManual) {
        answerRows.push({ question_id: id, correct_answer: q.correctAnswer })
      }
    }
  }

  console.log(`[${spec.name}] inserting ${questionRows.length} questions...`)
  const { error: qError } = await supabase.from('questions').insert(questionRows)
  if (qError) throw new Error(`questions insert failed: ${qError.message}`)

  console.log(`[${spec.name}] inserting ${answerRows.length} answer keys...`)
  const { error: aError } = await supabase.from('question_answers').insert(answerRows)
  if (aError) throw new Error(`question_answers insert failed: ${aError.message}`)

  const totalPoints = questionRows.reduce((sum, q) => sum + Number(q.max_points), 0)
  console.log(`[${spec.name}] done — ${questionRows.length} questions, ${totalPoints} points total, variant id ${spec.id}`)
  return spec.id
}
