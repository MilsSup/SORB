# SORB

Сервис бронирования общих ресурсов: помещений, оборудования, специалистов и спецзон.
Основа окружения взята из проекта `diplom` и адаптирована под техническое задание.

## Стек и структура

- `frontend/`: React 19, Vite 8, TypeScript 6, Tailwind CSS 4, React Router,
  TanStack Query, Axios и date-fns.
- `backend/`: Node.js, Fastify 5, TypeScript, Zod и Prisma 7 с адаптером `pg`.
  Установлены bcryptjs и JWT-плагин для будущего модуля авторизации.
- PostgreSQL 17 в Docker Compose. Данные хранятся в volume `sorb_sorb_db`.
- npm workspaces: одна установка и общий `package-lock.json` для всего проекта.

Из `diplom` сохранены инструменты фронтенда и подход к разделению API и клиента.
Вместо SQLite используется PostgreSQL по ТЗ, вместо Hono — Fastify из указанного
в ТЗ набора серверных фреймворков. Telegram-бот не входит в текущие требования.

Сейчас реализован только стартовый каркас: проверка API на стартовой странице,
проверки состояния сервера и БД, начальная модель пользователя с ролями.
Авторизация, ресурсы, бронирования, уведомления и календарь будут добавлены
на следующих этапах. Защита от пересечений и конкурентных бронирований потребует
отдельного проектирования транзакций и ограничений PostgreSQL.

## Требования

- Node.js 22.12+ в ветке 22 LTS либо Node.js 24 LTS и npm с поддержкой workspaces.
- Запущенный Docker Desktop с Linux-контейнерами и Docker Compose.

## Первая установка

В PowerShell из корня репозитория:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
npm ci
npm run db:up
npm run db:deploy
npm run dev
```

Копировать `.env.example` нужно только при первой настройке; не перезаписывайте
существующие `.env` со своими значениями. Prisma Client генерируется автоматически
при `npm ci`. Файлы `.env`, сгенерированный клиент и зависимости исключены из Git.

- Веб-приложение: http://localhost:5173
- API, проверка процесса: http://localhost:3000/health
- API, проверка подключения к PostgreSQL: http://localhost:3000/ready
- PostgreSQL: `localhost:5433`, БД `sorb`, пользователь `sorb`.

Порт базы 5433 выбран для совместимости с другими локальными проектами.
Учетные данные в примерах и Compose предназначены для локальной разработки.

## Проверки

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run prisma:validate -w backend
npm run db:check -w backend
```

`/health` не зависит от базы, `/ready` возвращает HTTP 503, если БД недоступна.
`db:check` проверяет также наличие таблицы пользователей после миграции.

При настройке окружения зависимости из `diplom` обновлены, включая Axios,
React Router, Vite, Vitest, Tailwind и Prisma. На момент установки `npm audit`
сообщает о четырех High-записях в цепочке Prisma 7.10 (`deepmerge-ts`, `mysql2`,
`@prisma/config`, `prisma`). Они остаются и в отчете `--omit=dev`.
Предлагаемый npm откат на Prisma 6 не применялся. Перед развертыванием следует
повторить аудит и проверить исправления этих зависимостей.

## База данных

```powershell
npm run db:up       # Запустить PostgreSQL и дождаться готовности
npm run db:deploy   # Применить сохраненные миграции
npm run db:migrate  # Создать миграцию после изменения схемы
npm run db:studio   # Открыть Prisma Studio
npm run db:logs     # Логи PostgreSQL
npm run db:down     # Остановить контейнеры, сохранив данные
```

Строка подключения находится в `backend/.env`, адрес API — в `frontend/.env`.
После изменения окружения перезапустите процессы разработки.

## Полный запуск через Docker

```powershell
npm run docker:up
npm run docker:down
```

Профиль `app` добавляет API и nginx со сборкой фронтенда; без него запускается
только PostgreSQL для локальной разработки. При запуске контейнера API сохраненные
миграции применяются автоматически. Освободите порты 3000 и 5173, остановив
локальные процессы `npm run dev`, перед запуском полного состава контейнеров.
