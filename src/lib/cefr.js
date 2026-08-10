// Пороги CEFR — доля от максимально возможного балла нұсқасы, не абсолютное число:
// эталон 80-балльного варианта (0-24 Pre-A1, 25-48 A1, 49-68 A2, 69-80 Above A2)
// даёт границы 30% / 60% / 85%. Варианты с другим количеством вопросов/баллов
// (например seed_sample_variant.sql на 50 баллов) считаются по тем же процентам.
export function cefrFromScore(score, maxScore = 80) {
  const pct = maxScore > 0 ? score / maxScore : 0
  if (pct > 0.85) return 'Above A2'
  if (pct > 0.6) return 'A2'
  if (pct > 0.3) return 'A1'
  return 'Pre-A1'
}
