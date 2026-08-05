-- Патч №3: чинит RLS-политику на загрузку Speaking-записей в Storage.
-- Выполнить в SQL Editor, если schema.sql/schema_patch_02 уже применены.
--
-- Симптом: студент проходит весь экзамен, но при загрузке аудио-ответа
-- (Speaking) браузер получает "StorageApiError: new row violates row-level
-- security policy". Обнаружено вживую при первом полном прогоне экзамена.
--
-- Причина №1: (storage.foldername(name))[1] ненадёжно совпадал с id::text для
-- пути вида "{attempt_id}/{question_id}.webm" — заменено на LIKE-сравнение
-- через exists(), что работает предсказуемо.
--
-- Причина №2 (проявилась после фикса №1): клиент грузит файл с upsert:true,
-- из-за чего Storage API требует ещё и доступ на UPDATE/SELECT, не только
-- INSERT — без этого та же ошибка повторяется даже с верной INSERT-политикой.

drop policy if exists "student upload own recording" on storage.objects;

create policy "student upload own recording" on storage.objects
  for insert
  with check (
    bucket_id = 'speaking-recordings'
    and exists (
      select 1 from exam_attempts a
      where a.student_id = auth.uid()
        and name like a.id::text || '/%'
    )
  );

create policy "student read own recording" on storage.objects
  for select
  using (
    bucket_id = 'speaking-recordings'
    and exists (
      select 1 from exam_attempts a
      where a.student_id = auth.uid()
        and name like a.id::text || '/%'
    )
  );

create policy "student update own recording" on storage.objects
  for update
  using (
    bucket_id = 'speaking-recordings'
    and exists (
      select 1 from exam_attempts a
      where a.student_id = auth.uid()
        and name like a.id::text || '/%'
    )
  );
