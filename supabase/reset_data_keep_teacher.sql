-- Разовый скрипт: полная очистка тестовых данных, остаётся только учитель.
-- Выполнить ЦЕЛИКОМ в SQL Editor. ДЕЙСТВИЕ НЕОБРАТИМО.
--
-- Порядок важен и делает скрипт коротким благодаря "on delete cascade",
-- уже объявленным в schema.sql:
--   1) удаляем всех учеников из auth.users (фильтр role = 'student' —
--      учителя не затрагивает) — это каскадом стирает их profiles,
--      exam_assignments, exam_attempts, student_answers, tab_events;
--   2) удаляем exam_variants — это каскадом стирает questions и
--      question_answers.
--
-- Файлы в Storage (speaking-recordings, question-images, listening-audio)
-- этим скриптом НЕ удаляются — DELETE по storage.objects из SQL стирает
-- только запись в каталоге, а не сам файл в бакете. На работу приложения
-- "осиротевшие" файлы не влияют, это просто занятое место; если нужно
-- освободить — почисти папки вручную через Dashboard → Storage.

-- Проверка "что удалится" (посмотреть перед запуском):
select count(*) as students_to_delete from profiles where role = 'student';
select count(*) as variants_to_delete from exam_variants;

-- Сам wipe:
delete from auth.users
where id in (select id from profiles where role = 'student');

delete from exam_variants;

-- Проверка, что осталось только нужное:
select role, count(*) from profiles group by role;
select count(*) as variants_left from exam_variants;
