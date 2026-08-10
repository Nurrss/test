-- Патч №5: RLS-олқылықтарды және деректер тұтастығы қателерін түзету.
-- Выполнить в SQL Editor после patch_02, patch_03, patch_04.
--
-- Бұл патч ешбір кестенің құрылымын өзгертпейді — тек триггерлер мен
-- resolve_attempt() RPC-функциясын түзетеді. Барлық стейтменттер
-- idempotent (CREATE OR REPLACE / DROP ... IF EXISTS), қайта іске
-- қосуға қауіпсіз.

-- ============================================
-- 1) profiles: студент/мұғалім өз "role" өрісін өзгерте алмауы керек.
--
-- "own profile update" саясатында (patch_02) WITH CHECK жоқ болатын —
-- бұл кез келген авторизацияланған қолданушыға
--   supabase.from('profiles').update({ role: 'teacher' }).eq('id', auth.uid())
-- шақыруы арқылы дереу мұғалім құқығын алуға мүмкіндік беретін.
-- Триггер RLS-тен тәуелсіз, барлық update жолдарын жабады.
-- ============================================
create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and new.role is distinct from old.role then
    raise exception 'Cannot change role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on profiles;
create trigger trg_prevent_role_change
  before update on profiles
  for each row execute function public.prevent_role_self_change();

-- ============================================
-- 2) exam_attempts: "student update own in-progress attempt" саясатында
-- (schema.sql) WITH CHECK жоқ — студент өзінің in_progress талпынысында
-- current_section-тан басқа кез келген өрісті (total_score, cefr_level,
-- auto_score, т.б.) өзгерте алатын еді. Клиент коды (ExamTakingView.vue)
-- бұл жолмен тек current_section-ды ғана жаңартады, сондықтан триггер
-- студент атынан келген update-терде соны ғана рұқсат етеді.
-- ============================================
create or replace function public.restrict_student_attempt_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_teacher() then
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

drop trigger if exists trg_restrict_student_attempt_update on exam_attempts;
create trigger trg_restrict_student_attempt_update
  before update on exam_attempts
  for each row execute function public.restrict_student_attempt_update();

-- ============================================
-- 3) student_answers.points_awarded: GradingQueueView.vue-де max_points-тан
-- асатын не теріс балл қоюдан client-side ғана сақтандыру бар еді, DB
-- деңгейінде ешбір тежеу жоқ болатын. CHECK constraint басқа кестеге
-- (questions) сілтей алмайды, сондықтан триггер қолданамыз.
-- ============================================
create or replace function public.clamp_points_awarded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max numeric;
begin
  if new.points_awarded is not null then
    select max_points into v_max from questions where id = new.question_id;
    if v_max is not null and (new.points_awarded < 0 or new.points_awarded > v_max) then
      raise exception 'points_awarded (%) out of range 0..%', new.points_awarded, v_max;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_clamp_points_awarded on student_answers;
create trigger trg_clamp_points_awarded
  before insert or update on student_answers
  for each row execute function public.clamp_points_awarded();

-- ============================================
-- 4) resolve_attempt(): бұрын ЖӘНЕ ЕҢ СОҢҒЫ assigned_at бар assignment-ті
-- ғана қарайтын. Мұғалім ResultsView.vue-де "Қайта тапсыруға рұқсат
-- беру" батырмасы арқылы белгілі бір (student_id, variant_id) жолында
-- allow_retake=true қояды — бірақ егер сол студентке кейін БАСҚА нұсқа
-- тағайындалса (жаңа жол, жаңарақ assigned_at), resolve_attempt сол
-- жаңа тағайындауды таңдайды да, ескі нұсқадағы allow_retake ешқашан
-- қаралмайды — рұқсат үнсіз ешнәрсе істемейді.
--
-- Түзету: allow_retake=true жолды бірінші кезекте таңдау (мұғалімнің
-- айқын әрекеті басым), ал ондай жол болмаса — бұрынғыдай ең соңғысын.
-- ============================================
create or replace function public.resolve_attempt()
returns exam_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment exam_assignments;
  v_existing exam_attempts;
  v_existing_found boolean;
  v_result exam_attempts;
begin
  select * into v_assignment
  from exam_assignments
  where student_id = auth.uid()
  order by allow_retake desc, assigned_at desc
  limit 1;

  if v_assignment is null then
    raise exception 'NO_ASSIGNMENT';
  end if;

  select * into v_existing
  from exam_attempts
  where student_id = auth.uid() and variant_id = v_assignment.variant_id
  order by created_at desc
  limit 1;
  v_existing_found := found;

  if v_existing_found and v_existing.status = 'in_progress' then
    return v_existing;
  end if;

  if v_existing_found then
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
