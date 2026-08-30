# CycloTrack
Персональний застосунок для відстеження настрою, ліків та щоденного самопочуття для людей з циклотимією.

**Стек:** React, Vite, Supabase, Tailwind CSS
## QA Documentation

- [Test Plan](docs/qa/test-plan.md)
- [Test Scenarios](docs/qa/test-scenarios.md)
- [Bug reports] (https://github.com/valentinasotnichuk18-pixel/CycloTrack/blob/main/CycloTrack-main/docs/qa/Bug-reports).

## Запуск проєкту локально

1. Клонуй репозиторій
2. Перейди в папку проєкту
3. Встанови залежності:
npm install

4. Створи файл `.env.local` в корені проєкту і додай змінні середовища:

VITE_SUPABASE_URL=твій_supabase_url
VITE_SUPABASE_ANON_KEY=твій_supabase_anon_key


Ці значення бери в Supabase Dashboard, розділ Project Settings, потім API Keys.

5. Запусти проєкт:

npm run dev
## Деплой

Проєкт задеплоєний на Vercel: https://cyclo-track.vercel.app

Крок 3: Збережи файл (Ctrl+S)

Крок 4: Заповш зміни в PowerShell:

git add README.md
git commit -m "docs: update README with actual Supabase setup instructions"
git push
