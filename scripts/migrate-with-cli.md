# Автоматическое выполнение миграций через Supabase CLI

## Установка Supabase CLI

```bash
npm install supabase --save-dev
```

## Настройка

1. Логин в Supabase:
```bash
npx supabase login
```

2. Связать проект:
```bash
npx supabase link --project-ref your-project-ref
```

Project ref можно найти в URL вашего Supabase проекта:
`https://app.supabase.com/project/your-project-ref`

## Выполнение миграций

### Вариант 1: Push миграций (рекомендуется)

```bash
npx supabase db push
```

Это выполнит все миграции из `supabase/migrations/` в порядке их именования.

### Вариант 2: Reset и применение миграций

```bash
# Пересоздать базу данных (удалит все данные!)
npx supabase db reset

# Или применить только новые миграции
npx supabase migration up
```

## Проверка статуса

```bash
npx supabase migration list
```

---

*Или используйте ручное выполнение через Dashboard → SQL Editor*

