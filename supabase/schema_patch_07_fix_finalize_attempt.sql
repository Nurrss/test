-- Патч №7: finalize_attempt() ешқашан нақты жұмыс істемеген — оқушы
-- экзаменді толық тапсырса да, попытка мәңгі "in_progress" күйінде
-- қалып, ешқашан бағаланбайтын еді. Дауыстап тексеру арқылы табылды
-- (10 тест оқушысымен толық экзаменді браузерде өткізу кезінде).
--
-- Себебі: patch_05-те қосылған trg_restrict_student_attempt_update
-- триггері "auth.role() = 'service_role' or is_teacher()" болмаса,
-- exam_attempts-тың status/auto_score/submitted_at және т.б. өрістерін
-- ЕСКІ мәніне мәжбүрлеп қайтарады — бұл finalize_attempt() SECURITY
-- DEFINER функциясы ІШІНДЕ жасаған UPDATE-ке де қолданылады, өйткені
-- SECURITY DEFINER auth.role()-ды өзгертпейді (ол әлі де "authenticated"
-- оқушы ретінде көрінеді, "service_role" емес). Нәтижесінде
-- finalize_attempt() қатесіз орындалады, бірақ ешнәрсе шын мәнінде
-- жаңармайды.
--
-- Түзету: finalize_attempt() өз UPDATE-інен бұрын транзакция-локал
-- флаг қояды (set_config), триггер сол флагты да сенімді деп таниды.
-- Клиент (браузер/PostgREST арқылы) бұл флагты өз бетімен қоя алмайды —
-- тек біздің SECURITY DEFINER функциямыздың ішінде ғана орнатылады,
-- сондықтан студенттің тікелей .update() шақыруын шектеу бұзылмайды.

create or replace function public.restrict_student_attempt_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role'
     or public.is_teacher()
     or current_setting('app.trusted_attempt_update', true) = 'true' then
    return new;
  end if;

  new.student_id := old.student_id;
  new.variant_id := old.variant_id;
  new.status := old.status;
  new.started_at := old.started_at;
  new.submitted_at := old.submitted_at;
  new.auto_score := old.auto_score;
  new.manual_score := old.manual_score;
  new.total_score := old.total_score;
  new.cefr_level := old.cefr_level;
  new.created_at := old.created_at;
  return new;
end;
$$;

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

  perform set_config('app.trusted_attempt_update', 'true', true);

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
