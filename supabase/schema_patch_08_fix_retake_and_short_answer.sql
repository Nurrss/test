-- Патч №8: код-ревью кезінде табылған екі баг.
--
-- 1) resolve_attempt(): patch_05 "allow_retake desc, assigned_at desc"
-- сұрыптауын қосты — мұғалім белгілі бір (student_id, variant_id) жолында
-- allow_retake=true қойса, ол әрқашан бірінші болып таңдалады. Бірақ
-- студент сол пересдачаны бірден өтпесе (немесе мүлдем өтпесе) де, бұл
-- allow_retake=true жол МӘҢГІ бірінші болып қала береді — тіпті мұғалім
-- кейін мүлдем басқа, жаңарақ нұсқа тағайындаса да (allow_retake=false,
-- assigned_at жаңарақ). Нәтижесінде студент әрдайым ескі нұсқаға қайтарыла
-- береді, ал жаңа тағайындау ешқашан қаралмайды.
--
-- Түзету: assignment-терді assigned_at бойынша ЕҢ ЖАҢАСЫНАН бастап
-- қараймыз және біріншісін аламыз, тек мына шарттардың біреуі орындалса:
--   - бұл нұсқаға әлі талпыныс жоқ, немесе
--   - талпыныс "in_progress" күйінде, немесе
--   - осы assignment жолында allow_retake=true.
-- Яғни жаңа тағайындау әрқашан басым болады (себебі бірінші тексеріледі),
-- ал allow_retake=true тек сол assignment ЕҢ ЖАҢА болғанда/одан жаңасы
-- "аяқталған әрі retake рұқсатсыз" болмағанда ғана іске қосылады.
--
-- 2) submit_answer(): short_answer сұрақтарында автотексеру дәл jsonb
-- string теңдігімен (p_answer = v_correct) жасалатын — регистр мен
-- бос орындар (case/whitespace) сәйкессіздігінде дұрыс жауап та қате деп
-- саналатын. "Paris" деп сақталған дұрыс жауапқа студент "paris" немесе
-- "Paris " (соңында бос орын) деп жазса, ұпай алмай қалатын.
--
-- Түзету: тек short_answer түрі үшін екі жағын да lower(trim(...))
-- арқылы салыстырамыз. multiple_choice/true_false/matching өзгеріссіз
-- қалады — оларда p_answer нұсқа id-і (мысалы "a"), еркін мәтін емес.

create or replace function public.resolve_attempt()
returns exam_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment exam_assignments;
  v_candidate exam_assignments;
  v_existing exam_attempts;
  v_result exam_attempts;
begin
  v_assignment := null;

  for v_candidate in
    select * from exam_assignments
    where student_id = auth.uid()
    order by assigned_at desc
  loop
    select * into v_existing
    from exam_attempts
    where student_id = auth.uid() and variant_id = v_candidate.variant_id
    order by created_at desc
    limit 1;

    if not found or v_existing.status = 'in_progress' or v_candidate.allow_retake then
      v_assignment := v_candidate;
      exit;
    end if;
  end loop;

  if v_assignment is null then
    raise exception 'NO_ASSIGNMENT';
  end if;

  select * into v_existing
  from exam_attempts
  where student_id = auth.uid() and variant_id = v_assignment.variant_id
  order by created_at desc
  limit 1;

  if found and v_existing.status = 'in_progress' then
    return v_existing;
  end if;

  if found then
    if not v_assignment.allow_retake then
      raise exception 'ALREADY_SUBMITTED';
    end if;

    update exam_assignments set allow_retake = false where id = v_assignment.id;
  end if;

  insert into exam_attempts (student_id, variant_id, current_section)
  values (auth.uid(), v_assignment.variant_id, 'listening')
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.resolve_attempt() to authenticated;

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
        v_is_correct := (
          lower(trim(both from (p_answer #>> '{}'))) = lower(trim(both from (v_correct #>> '{}')))
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
