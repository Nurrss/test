-- Патч №6: учитель может создавать/редактировать варианты и вопросы из
-- интерфейса приложения, а не только вручную через SQL Editor.
-- Выполнить целиком в SQL Editor ПОСЛЕ всех предыдущих патчей.
--
-- До этого патча на exam_variants/questions/question_answers не было ни
-- одной insert/update/delete политики — единственный способ наполнить их
-- был SQL Editor (выполняется от имени владельца БД, RLS не применяется).

-- ============================================
-- exam_variants: учитель создаёт/редактирует/удаляет
-- ============================================
create policy "teacher insert variants" on exam_variants
  for insert with check (public.is_teacher());
create policy "teacher update variants" on exam_variants
  for update using (public.is_teacher());
create policy "teacher delete variants" on exam_variants
  for delete using (public.is_teacher());

-- ============================================
-- questions: учитель создаёт/редактирует/удаляет
-- ============================================
create policy "teacher insert questions" on questions
  for insert with check (public.is_teacher());
create policy "teacher update questions" on questions
  for update using (public.is_teacher());
create policy "teacher delete questions" on questions
  for delete using (public.is_teacher());

-- ============================================
-- question_answers: учитель пишет и читает правильные ответы (нужно для
-- редактора — иначе при повторном открытии вопроса не видно, какой
-- вариант был отмечен как правильный). Гарантия "ответы не попадают
-- в браузер" по-прежнему держится для УЧЕНИКА — старая политика
-- "no direct access to answers" (select using (false)) остаётся
-- действовать для всех ролей без отдельной teacher-политики on select,
-- поэтому добавляем её явно, как уже сделано для student_answers
-- ("teacher read all answers" в schema.sql).
-- ============================================
create policy "teacher read answers" on question_answers
  for select using (public.is_teacher());
create policy "teacher insert answers" on question_answers
  for insert with check (public.is_teacher());
create policy "teacher update answers" on question_answers
  for update using (public.is_teacher());
create policy "teacher delete answers" on question_answers
  for delete using (public.is_teacher());

-- ============================================
-- Storage: новый публичный bucket для картинок вопросов
-- (фото для Listening "word/sentence recognition", Reading visual
-- recognition и т.д.) — того же вида, что уже существующий
-- listening-audio.
-- ============================================
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

-- Раньше listening-audio грузился только вручную через Dashboard
-- (insert-политики не было вообще). Теперь учитель может загружать
-- аудио/картинки прямо из редактора вариантов.
create policy "teacher upload question media" on storage.objects
  for insert
  with check (bucket_id in ('listening-audio', 'question-images') and public.is_teacher());

create policy "teacher update question media" on storage.objects
  for update
  using (bucket_id in ('listening-audio', 'question-images') and public.is_teacher());

create policy "teacher delete question media" on storage.objects
  for delete
  using (bucket_id in ('listening-audio', 'question-images') and public.is_teacher());

-- select-политика не нужна: оба bucket'а public = true, поэтому
-- getPublicUrl()-чтение не проходит через RLS вообще.
