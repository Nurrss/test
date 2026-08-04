# Ағылшын тілі — онлайн емтихан платформасы

Vue 3 (Vite) + Supabase (Postgres, Auth, Storage). Роли: **teacher** (учитель) и
**student** (ученик). Текущий этап — скелет всей платформы: роутинг, дизайн-система,
layout, все 8 экранов вёрсткой с mock-данными. Реально работает: вход через Supabase
Auth с редиректом по роли, запись голоса (`MediaRecorder`) и antileave-попап на экране
экзамена.

## Настройка Supabase

1. Проект на [supabase.com](https://supabase.com) (тот же, что использовался для
   прототипа записи голоса, — схема ниже его заменяет).
2. Откройте SQL Editor и выполните **весь** `supabase/schema.sql` из этого репозитория.
   Файл начинается с миграции, которая снимает старые прототипные таблицы
   `recordings`/`tab_events` (несовместимы с новой схемой — новый `tab_events`
   завязан на `attempt_id`), затем создаёт полную схему: `profiles`, `exam_variants`,
   `questions`, `question_answers`, `exam_assignments`, `exam_attempts`,
   `student_answers`, `tab_events`, индексы, RLS-политики и buckets
   `speaking-recordings` (приватный) / `listening-audio` (публичный).
3. В Project Settings → API возьмите `Project URL` и `anon public` (Publishable) key.
4. Заведите первого учителя вручную: Dashboard → Authentication → Add user (email +
   пароль) → скопируйте его `id`, затем в SQL Editor:
   ```sql
   insert into profiles (id, role, full_name)
   values ('<uuid пользователя>', 'teacher', 'Аты-жөні');
   ```
   Самостоятельная регистрация не предусмотрена по архитектуре — учеников и учителей
   заводит администратор.

## Настройка проекта

```bash
npm install
cp .env.example .env
# впишите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env
npm run dev
```

## Что уже работает / что mock

- **Вход** (`/login`) — реальный `supabase.auth.signInWithPassword`: учитель по email,
  ученик по телефону (внутри — синтетический email `{phone}@students.local`, т.к. SMS
  провайдер не настроен). После входа — редирект по роли (`teacher → /dashboard`,
  `student → /exam`), защита роутов через `router/index.js`.
- **Экран экзамена** (`/exam`) — реальный `MediaRecorder` для audio_response-вопроса и
  реальные слушатели `visibilitychange`/`window blur/focus` с попапом-предупреждением
  (лог в консоль; запись в `tab_events` — TODO, появится вместе с созданием
  `exam_attempts`). Вопросы/варианты — локальный mock-массив.
- **Остальные экраны** (дашборд, ученики, экзамены, оценивание, настройки, результаты) —
  визуальная вёрстка с mock-данными. Реальные запросы к Supabase (`exam_attempts`,
  `profiles`, `exam_variants` и т.д.) добавляются в следующих проходах по каждому
  экрану — везде отмечено `// TODO`.
- **Edge Functions** (`submit-answer`, `finalize-attempt`, `get-recording-url`) — вне
  рамок этого этапа.

## Структура

```
src/
 ├─ router/index.js            -- роуты + guard по роли
 ├─ stores/auth.js              -- Pinia: сессия, профиль, signIn/signOut
 ├─ lib/supabase.js             -- клиент Supabase
 ├─ components/
 │   ├─ layout/                 -- Sidebar, Header, AppShell
 │   ├─ shared/                 -- AppCard, AppButton, AppInput, StatCard,
 │   │                             ScoreDonut, ProgressBar, CefrBadge, DataTable,
 │   │                             DecorZone, AddStudentModal
 │   ├─ exam/                   -- ExamProgressSidebar, Question*, TabWarningModal
 │   ├─ dashboard/               -- RecentResultsTable, VariantsManagerPanel
 │   └─ results/                 -- SectionScoreBars, CefrScaleTable, ProgressChart,
 │                                  ComparisonChart
 ├─ views/                      -- 8 экранов (Login, TeacherDashboard, Students,
 │                                  Exams, GradingQueue, Settings, ExamTaking, Results)
 ├─ App.vue
 └─ main.js
supabase/
 └─ schema.sql                  -- полная схема БД + RLS + storage
```
