-- Прототип: запись голоса + antileave
-- Выполнить в SQL Editor вашего проекта Supabase.

create extension if not exists pgcrypto;

-- Таблица записей голоса
create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  file_url text,
  duration_seconds numeric,
  created_at timestamp with time zone default now()
);

alter table recordings enable row level security;

-- Прототип: разрешаем анонимный insert/select для теста.
-- На проде заменить на политики с проверкой auth.uid().
create policy "anon insert recordings" on recordings
  for insert to anon
  with check (true);

create policy "anon select recordings" on recordings
  for select to anon
  using (true);

-- Таблица событий переключения вкладки/окна
create table if not exists tab_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'tab_switch' | 'window_blur'
  created_at timestamp with time zone default now()
);

alter table tab_events enable row level security;

create policy "anon insert tab_events" on tab_events
  for insert to anon
  with check (true);

create policy "anon select tab_events" on tab_events
  for select to anon
  using (true);

-- Storage: создайте bucket "recordings" через Dashboard (Storage -> New bucket, Public)
-- либо через SQL:
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', true)
on conflict (id) do nothing;

-- Политики Storage для анонимной загрузки/чтения (только для прототипа)
create policy "anon upload recordings bucket" on storage.objects
  for insert to anon
  with check (bucket_id = 'recordings');

create policy "anon read recordings bucket" on storage.objects
  for select to anon
  using (bucket_id = 'recordings');
