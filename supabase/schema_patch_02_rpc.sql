-- Патч №2: проверка ответов и завершение попытки через RPC-функции.
-- Выполнить целиком в SQL Editor ПОСЛЕ основного schema.sql.
--
-- Почему RPC, а не Edge Function (как в исходном ТЗ): submit-answer/finalize-attempt
-- не делают внешних вызовов (email, сторонние API) — это чистая работа с БД, поэтому
-- SECURITY DEFINER-функция даёт ту же гарантию (правильные ответы из question_answers
-- никогда не покидают Postgres) и разворачивается тем же способом, что и вся схема —
-- через SQL Editor, без Supabase CLI/деплоя Edge Function.

-- ============================================
-- submit_answer: сохраняет ответ ученика, автопроверяет
-- Listening/Reading (requires_manual_grading = false)
-- ============================================
create or replace function public.submit_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_answer jsonb,
  p_audio_path text default null
)
returns student_answers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt exam_attempts;
  v_question questions;
  v_correct jsonb;
  v_is_correct boolean := null;
  v_points numeric := null;
  v_result student_answers;
begin
  select * into v_attempt from exam_attempts where id = p_attempt_id;
  if v_attempt is null or v_attempt.student_id <> auth.uid() then
    raise exception 'Attempt not found or not owned by current user';
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'Attempt is not in progress';
  end if;

  select * into v_question from questions where id = p_question_id;
  if v_question is null or v_question.variant_id <> v_attempt.variant_id then
    raise exception 'Question does not belong to this attempt''s variant';
  end if;

  if not v_question.requires_manual_grading then
    select correct_answer into v_correct from question_answers where question_id = p_question_id;
    if v_correct is not null then
      v_is_correct := (p_answer = v_correct);
      v_points := case when v_is_correct then v_question.max_points else 0 end;
    end if;
  end if;

  insert into student_answers (attempt_id, question_id, answer, audio_path, is_correct, points_awarded, submitted_at)
  values (p_attempt_id, p_question_id, p_answer, p_audio_path, v_is_correct, v_points, now())
  on conflict (attempt_id, question_id)
  do update set
    answer = excluded.answer,
    audio_path = excluded.audio_path,
    is_correct = excluded.is_correct,
    points_awarded = excluded.points_awarded,
    submitted_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.submit_answer(uuid, uuid, jsonb, text) to authenticated;

-- ============================================
-- finalize_attempt: закрывает попытку, считает auto_score
-- (Listening+Reading). manual_score/total_score/cefr_level
-- проставляются позже учителем после проверки Writing/Speaking.
-- ============================================
create or replace function public.finalize_attempt(p_attempt_id uuid)
returns exam_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt exam_attempts;
  v_auto_score numeric;
  v_result exam_attempts;
begin
  select * into v_attempt from exam_attempts where id = p_attempt_id;
  if v_attempt is null or v_attempt.student_id <> auth.uid() then
    raise exception 'Attempt not found or not owned by current user';
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'Attempt is already finalized';
  end if;

  select coalesce(sum(sa.points_awarded), 0)
  into v_auto_score
  from student_answers sa
  join questions q on q.id = sa.question_id
  where sa.attempt_id = p_attempt_id
    and q.section in ('listening', 'reading');

  update exam_attempts
  set auto_score = v_auto_score,
      status = 'submitted',
      submitted_at = now(),
      current_section = 'done'
  where id = p_attempt_id
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.finalize_attempt(uuid) to authenticated;

-- ============================================
-- Новые RLS-политики
-- ============================================

-- Settings: учитель/ученик может обновить своё собственное имя.
create policy "own profile update" on profiles
  for update using (id = auth.uid());

-- Бағалау: учитель проставляет manual_score/total_score/cefr_level/status='graded'
-- после проверки Writing/Speaking.
create policy "teacher update attempts" on exam_attempts
  for update using (public.is_teacher());

-- Бағалау: учитель может сгенерировать signed URL для прослушивания Speaking-ответа
-- (createSignedUrl проверяет select-policy на объект в момент генерации ссылки).
create policy "teacher read speaking recordings" on storage.objects
  for select using (bucket_id = 'speaking-recordings' and public.is_teacher());
