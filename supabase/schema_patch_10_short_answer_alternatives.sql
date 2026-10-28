-- Патч №10: short_answer — бірнеше дұрыс жауап нұсқасы.
--
-- Gap-fill сұрақтарында (мыс. B1 Listening: "7 / seven", "bus stop /
-- busstop") бір ғана дұрыс жауап жолы жеткіліксіз. Енді question_answers
-- ішіндегі short_answer жауабы "|" арқылы бөлінген баламалар тізімі бола
-- алады: "7 | seven". Салыстыру регистрсіз, шеткі бос орындарсыз, ал ішкі
-- бірнеше бос орын біреуге қысқарады.
--
-- Кері үйлесімді: "|" жоқ ескі жауаптар бұрынғыдай бір жол ретінде
-- салыстырылады. multiple_choice/true_false/matching өзгеріссіз.

create or replace function public.normalize_short_answer(p text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(trim(both from coalesce(p, ''))), '\s+', ' ', 'g')
$$;

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
      if v_question.question_type = 'short_answer' then
        v_is_correct := exists (
          select 1
          from unnest(string_to_array(v_correct #>> '{}', '|')) as alt
          where public.normalize_short_answer(alt) <> ''
            and public.normalize_short_answer(alt) = public.normalize_short_answer(p_answer #>> '{}')
        );
      else
        v_is_correct := (p_answer = v_correct);
      end if;
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
