# Прототип: запись голоса + antileave

Одностраничный Vue 3 (Vite) прототип для проверки двух механик перед интеграцией
в основную платформу: запись голоса с сохранением в Supabase и отслеживание
переключения вкладки/окна с попапом-предупреждением. Без авторизации и
экзаменационной логики.

## Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте SQL Editor и выполните `supabase/schema.sql` из этого репозитория —
   он создаёт таблицы `recordings` и `tab_events`, включает RLS с политиками
   `anon insert/select` (только для прототипа) и создаёт публичный bucket
   `recordings` в Storage.
3. Если предпочитаете создать bucket вручную: Storage → New bucket → имя
   `recordings` → Public bucket.
4. В Project Settings → API возьмите `Project URL` и `anon public` ключ.

## Настройка проекта

```bash
npm install
cp .env.example .env
# впишите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env
npm run dev
```

Без заполненного `.env` страница откроется, но сохранение записей и логирование
событий в Supabase будет недоступно (в консоли появится предупреждение).

## Что проверяем

- **Запись голоса** — `MediaRecorder`, сохранение `.webm` в Supabase Storage
  (bucket `recordings`), метаданные — в таблицу `recordings`. Список записей
  под формой обновляется реактивно после сохранения, без перезагрузки страницы.
- **Antileave-попап** — `visibilitychange` + `window blur/focus`. При потере
  активности вкладки/окна событие пишется в консоль и в таблицу `tab_events`;
  при возврате показывается модальное окно-предупреждение.

## Структура

```
src/
 ├─ components/
 │   ├─ VoiceRecorder.vue     -- запись + сохранение
 │   ├─ RecordingsTable.vue   -- таблица записей
 │   └─ TabWarningModal.vue   -- попап предупреждения
 ├─ lib/
 │   └─ supabase.js           -- инициализация клиента
 ├─ App.vue                   -- сборка страницы + antileave-логика
 └─ main.js
supabase/
 └─ schema.sql                -- таблицы, RLS-политики, bucket
```
