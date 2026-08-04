// Пороги CEFR (см. supabase/schema.sql / ТЗ): 0-24 Pre-A1, 25-48 A1, 49-68 A2, 69-80 Above A2.
export function cefrFromScore(score) {
  if (score >= 69) return 'Above A2'
  if (score >= 49) return 'A2'
  if (score >= 25) return 'A1'
  return 'Pre-A1'
}
