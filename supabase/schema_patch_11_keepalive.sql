-- Патч №11: keep-alive heartbeat.
--
-- Бұрынғы GitHub Action anon кілтпен exam_variants-ке SELECT жасайтын, бірақ
-- RLS anon-ға ештеңе көрсетпейді (тек authenticated) — сұрау бос [] қайтарып,
-- Supabase оны белсенділік деп санамаған: 2026-10-07 сәтті пингтен кейін
-- 2 күн ішінде жоба бәрібір paused болды.
--
-- Енді Action күн сайын keepalive_ping() RPC-ін шақырады: ол бір жолды
-- нақты ЖАЗАДЫ (upsert), яғни дерекқорда шынайы транзакция болады.
-- Кестеге тікелей қол жеткізу жоқ (RLS қосулы, policy жоқ); функция тек
-- бір timestamp-ты жаңартады, сондықтан anon-ға ашық болса да зиянсыз.

create table if not exists public.keepalive (
  id int primary key default 1,
  pinged_at timestamptz not null default now(),
  constraint keepalive_single_row check (id = 1)
);

alter table public.keepalive enable row level security;

create or replace function public.keepalive_ping()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  insert into keepalive (id, pinged_at) values (1, now())
  on conflict (id) do update set pinged_at = excluded.pinged_at
  returning pinged_at
$$;

revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon, authenticated;
