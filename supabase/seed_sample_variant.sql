-- Тестовые данные: один вариант A2 с вопросами на каждый question_type,
-- чтобы можно было реально пройти экзамен end-to-end.
-- Выполнить в SQL Editor после schema.sql и schema_patch_02_rpc.sql.
--
-- Использует фиксированные uuid, поэтому безопасно выполнять повторно
-- (ON CONFLICT DO NOTHING) — старые данные не дублируются.

insert into exam_variants (id, name, level, is_active)
values ('00000000-0000-0000-0000-000000000001', 'A2 — Нұсқа 1 (тест)', 'A2', true)
on conflict (id) do nothing;

-- Listening: multiple_choice
insert into questions (id, variant_id, section, order_index, question_type, content, max_points, requires_manual_grading)
values (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'listening', 1, 'multiple_choice',
  '{"text": "Тыңдаңыз: әңгіме қайда өтіп жатыр?", "options": [
      {"id": "a", "label": "Әуежайда"},
      {"id": "b", "label": "Мейрамханада"},
      {"id": "c", "label": "Қонақүйде"}
    ]}'::jsonb,
  10, false
)
on conflict (id) do nothing;

insert into question_answers (question_id, correct_answer)
values ('00000000-0000-0000-0000-000000000011', '"a"'::jsonb)
on conflict (question_id) do nothing;

-- Listening: true_false
insert into questions (id, variant_id, section, order_index, question_type, content, max_points, requires_manual_grading)
values (
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'listening', 2, 'true_false',
  '{"text": "Тыңдаңыз және сөйлемнің дұрыс/бұрыс екенін белгілеңіз.",
    "statement": "They are near the lake.",
    "options": [
      {"id": "true", "label": "Дұрыс"},
      {"id": "false", "label": "Бұрыс"}
    ]}'::jsonb,
  10, false
)
on conflict (id) do nothing;

insert into question_answers (question_id, correct_answer)
values ('00000000-0000-0000-0000-000000000012', '"true"'::jsonb)
on conflict (question_id) do nothing;

-- Reading: multiple_choice
insert into questions (id, variant_id, section, order_index, question_type, content, max_points, requires_manual_grading)
values (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'reading', 1, 'multiple_choice',
  '{"text": "Мәтінді оқып, ең жақсы тақырыпты таңдаңыз.", "options": [
      {"id": "a", "label": "A Trip to the Mountains"},
      {"id": "b", "label": "How to Cook Pilaf"},
      {"id": "c", "label": "Learning a New Language"}
    ]}'::jsonb,
  10, false
)
on conflict (id) do nothing;

insert into question_answers (question_id, correct_answer)
values ('00000000-0000-0000-0000-000000000021', '"a"'::jsonb)
on conflict (question_id) do nothing;

-- Writing: open_text (manual grading)
insert into questions (id, variant_id, section, order_index, question_type, content, max_points, requires_manual_grading)
values (
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000001',
  'writing', 1, 'open_text',
  '{"text": "Сүйікті маусымыңыз туралы қысқа абзац жазыңыз (80-100 сөз).",
    "placeholder": "My favorite season is..."}'::jsonb,
  10, true
)
on conflict (id) do nothing;

-- Speaking: audio_response (manual grading)
insert into questions (id, variant_id, section, order_index, question_type, content, max_points, requires_manual_grading)
values (
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000001',
  'speaking', 1, 'audio_response',
  '{"text": "Қалаңызды сипаттаңыз. Шамамен бір минут сөйлеңіз."}'::jsonb,
  10, true
)
on conflict (id) do nothing;

-- ============================================
-- Назначение варианта ученику — замените плейсхолдер на реальный id
-- ученика из profiles (role='student') и раскомментируйте:
-- ============================================
-- insert into exam_assignments (student_id, variant_id)
-- values ('<uuid ученика из profiles>', '00000000-0000-0000-0000-000000000001')
-- on conflict (student_id, variant_id) do nothing;
