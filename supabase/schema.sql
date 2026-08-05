-- Экзаменационная платформа — полная схема БД.
-- Выполнить целиком в SQL Editor вашего проекта Supabase.
--
-- Это ЗАМЕНЯЕТ прототипную схему (recordings/tab_events из этапа
-- "запись голоса + antileave"). Новый tab_events завязан на attempt_id
-- и конфликтует по имени со старым, поэтому старые объекты дропаются.

create extension if not exists pgcrypto;

-- ============================================
-- МИГРАЦИЯ: снос прототипных объектов
-- ============================================
drop table if exists tab_events cascade;
drop table if exists recordings cascade;
-- Bucket "recordings" не конфликтует по имени с новыми bucket'ами и не мешает
-- новой схеме — удалить его напрямую через SQL нельзя (Supabase блокирует
-- DELETE на storage.objects/storage.buckets). Если хотите убрать его,
-- сделайте это вручную: Dashboard → Storage → recordings → Delete bucket.

-- ============================================
-- ПРОФИЛИ (роль пользователя поверх auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  full_name text not null,
  phone text unique,              -- для учеников
  group_name text,                -- класс/группа
  created_at timestamptz default now()
);

-- ============================================
-- ВАРИАНТЫ ЭКЗАМЕНА
-- ============================================
create table exam_variants (
  id uuid primary key default gen_random_uuid(),
  name text not null,                     -- "A2 - Вариант 1"
  level text not null,                    -- целевой уровень для отбора вопросов
  listening_time_limit_sec int default 900,
  reading_time_limit_sec int default 1200,
  writing_time_limit_sec int default 900,
  speaking_time_limit_sec int default 420,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- ВОПРОСЫ
-- ============================================
create table questions (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references exam_variants(id) on delete cascade,
  section text not null check (section in ('listening','reading','writing','speaking')),
  order_index int not null,               -- порядок внутри раздела
  question_type text not null check (question_type in (
    'multiple_choice','true_false','matching','short_answer','open_text','audio_response'
  )),
  content jsonb not null,                 -- текст вопроса, варианты ответа, картинки, ссылка на аудио и т.д.
  media_url text,                         -- аудио для Listening / картинка для Reading
  max_points numeric not null default 1,
  requires_manual_grading boolean not null default false,  -- true для writing/speaking
  created_at timestamptz default now()
);

-- ============================================
-- ПРАВИЛЬНЫЕ ОТВЕТЫ (изолировано от student RLS!)
-- ============================================
create table question_answers (
  question_id uuid primary key references questions(id) on delete cascade,
  correct_answer jsonb not null           -- формат зависит от question_type
);

-- ============================================
-- НАЗНАЧЕНИЕ ВАРИАНТА УЧЕНИКУ
-- ============================================
create table exam_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  variant_id uuid not null references exam_variants(id),
  assigned_at timestamptz default now(),
  unique (student_id, variant_id)
);

-- ============================================
-- ПОПЫТКА ПРОХОЖДЕНИЯ ЭКЗАМЕНА
-- ============================================
create table exam_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  variant_id uuid not null references exam_variants(id),
  status text not null default 'in_progress'
    check (status in ('in_progress','submitted','graded')),
  current_section text default 'listening'
    check (current_section in ('listening','reading','writing','speaking','done')),
  started_at timestamptz default now(),
  submitted_at timestamptz,
  auto_score numeric default 0,           -- сумма Listening+Reading
  manual_score numeric,                   -- сумма Writing+Speaking (после проверки учителем)
  total_score numeric,                    -- заполняется, когда обе части готовы
  cefr_level text,                        -- 'Pre-A1' | 'A1' | 'A2' | 'Above A2'
  created_at timestamptz default now()
);

-- ============================================
-- ОТВЕТЫ УЧЕНИКА
-- ============================================
create table student_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references exam_attempts(id) on delete cascade,
  question_id uuid not null references questions(id),
  answer jsonb,                           -- выбранный вариант / текст / и т.д.
  audio_path text,                        -- путь в Storage, если audio_response
  is_correct boolean,                     -- для автопроверяемых
  points_awarded numeric,
  graded_by uuid references profiles(id), -- учитель, если ручная проверка
  graded_at timestamptz,
  teacher_feedback text,
  submitted_at timestamptz default now(),
  unique (attempt_id, question_id)
);

-- ============================================
-- ANTI-CHEAT ЛОГ
-- ============================================
create table tab_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references exam_attempts(id) on delete cascade,
  event_type text not null check (event_type in ('tab_switch','window_blur','fullscreen_exit')),
  occurred_at timestamptz default now()
);

-- ============================================
-- Индексы
-- ============================================
create index idx_attempts_student on exam_attempts(student_id);
create index idx_attempts_status on exam_attempts(status);
create index idx_answers_attempt on student_answers(attempt_id);
create index idx_questions_variant_section on questions(variant_id, section, order_index);
create index idx_tabevents_attempt on tab_events(attempt_id);

-- ============================================
-- RLS
-- ============================================
alter table profiles enable row level security;
alter table exam_variants enable row level security;
alter table questions enable row level security;
alter table question_answers enable row level security;
alter table exam_assignments enable row level security;
alter table exam_attempts enable row level security;
alter table student_answers enable row level security;
alter table tab_events enable row level security;

-- Проверка "текущий пользователь — учитель" через SECURITY DEFINER-функцию.
-- Без неё политика на profiles, которая сама делает SELECT из profiles,
-- вызывает infinite recursion (RLS применяется к своей же подзапросу).
-- SECURITY DEFINER выполняет внутренний SELECT с правами владельца функции
-- (обходя RLS), поэтому рекурсии не происходит.
create or replace function public.is_teacher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'teacher'
  );
$$;

-- profiles: каждый видит себя, учитель видит всех
create policy "own profile" on profiles
  for select using (id = auth.uid());
create policy "teacher sees all profiles" on profiles
  for select using (public.is_teacher());

-- exam_variants: читают все авторизованные (для отображения списка вариантов)
create policy "authenticated read variants" on exam_variants
  for select using (auth.uid() is not null);

-- questions: студент видит вопросы только своего назначенного варианта, БЕЗ correct_answer
create policy "student sees assigned variant questions" on questions
  for select using (
    exists (
      select 1 from exam_assignments a
      where a.student_id = auth.uid() and a.variant_id = questions.variant_id
    )
    or public.is_teacher()
  );

-- question_answers: НИКТО с фронта не может это читать. Доступ только через service role в Edge Function.
create policy "no direct access to answers" on question_answers
  for select using (false);

-- exam_assignments: студент видит свои назначения, учитель — все
create policy "student own assignments" on exam_assignments
  for select using (student_id = auth.uid());
create policy "teacher sees all assignments" on exam_assignments
  for select using (public.is_teacher());

-- exam_attempts: студент видит и создаёт только свои попытки
create policy "student own attempts" on exam_attempts
  for select using (student_id = auth.uid());
create policy "student create own attempt" on exam_attempts
  for insert with check (student_id = auth.uid());
create policy "student update own in-progress attempt" on exam_attempts
  for update using (student_id = auth.uid() and status = 'in_progress');
create policy "teacher sees all attempts" on exam_attempts
  for select using (public.is_teacher());

-- student_answers: студент пишет только в свою попытку, читает только свою
create policy "student own answers" on student_answers
  for select using (
    exists (select 1 from exam_attempts a where a.id = student_answers.attempt_id and a.student_id = auth.uid())
  );
create policy "student insert own answers" on student_answers
  for insert with check (
    exists (select 1 from exam_attempts a where a.id = attempt_id and a.student_id = auth.uid() and a.status = 'in_progress')
  );
create policy "teacher grade answers" on student_answers
  for update using (public.is_teacher());
create policy "teacher read all answers" on student_answers
  for select using (public.is_teacher());

-- tab_events: студент только вставляет для своей попытки, учитель читает всё
create policy "student insert own tab events" on tab_events
  for insert with check (
    exists (select 1 from exam_attempts a where a.id = attempt_id and a.student_id = auth.uid())
  );
create policy "teacher read tab events" on tab_events
  for select using (public.is_teacher());

-- ============================================
-- Storage
-- ============================================
-- speaking-recordings: приватный bucket, доступ через signed URL (Edge Function, следующий этап)
-- listening-audio: публичный bucket — исходные аудио вопросов, не приватные данные
insert into storage.buckets (id, name, public)
values
  ('speaking-recordings', 'speaking-recordings', false),
  ('listening-audio', 'listening-audio', true)
on conflict (id) do nothing;

-- студент может загрузить запись только в папку своего attempt_id
-- (LIKE-сравнение вместо storage.foldername()[1] — надёжнее для путей вида
-- "{attempt_id}/{question_id}.webm", проверено вживую после первого запуска).
-- SELECT/UPDATE-политики тоже нужны студенту: клиент грузит файл с upsert:true,
-- и Storage API в этом случае проверяет доступ на обновление, а не только insert.
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

-- учитель читает listening-audio публично (bucket public = true, доп. политика не нужна для select)
-- запись в listening-audio с фронта не даём — загружается вручную через Dashboard.

-- ============================================
-- Примечание: exam_variants / questions / question_answers
-- не получают публичных INSERT/UPDATE/DELETE политик —
-- наполняются вручную через Supabase Dashboard/SQL Editor.
-- ============================================
