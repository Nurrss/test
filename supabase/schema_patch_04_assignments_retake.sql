-- Патч №4: назначение экзамена учителем + управляемая пересдача.
-- Выполнить в SQL Editor после patch_02 и patch_03.

-- ============================================
-- Учитель может назначать/переназначать варианты
-- (раньше у exam_assignments были только select-политики)
-- ============================================
create policy "teacher assign exam" on exam_assignments
  for insert
  with check (public.is_teacher());

create policy "teacher update assignments" on exam_assignments
  for update
  using (public.is_teacher());

-- ============================================
-- Пересдача: учитель выставляет allow_retake=true на назначение,
-- ученик "тратит" это разрешение при следующем заходе на /exam.
-- ============================================
alter table exam_assignments
  add column if not exists allow_retake boolean not null default false;

-- ============================================
-- resolve_attempt: единая точка входа для /exam — находит/резюмирует/
-- создаёт попытку атомарно (SECURITY DEFINER, как submit_answer/
-- finalize_attempt), вместо отдельных select+insert на клиенте.
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
  v_result exam_attempts;
begin
  select * into v_assignment
  from exam_assignments
  where student_id = auth.uid()
  order by assigned_at desc
  limit 1;

  if v_assignment is null then
    raise exception 'NO_ASSIGNMENT';
  end if;

  select * into v_existing
  from exam_attempts
  where student_id = auth.uid() and variant_id = v_assignment.variant_id
  order by created_at desc
  limit 1;

  if v_existing is not null and v_existing.status = 'in_progress' then
    return v_existing;
  end if;

  if v_existing is not null then
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
