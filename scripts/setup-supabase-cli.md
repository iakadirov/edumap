# Настройка Supabase CLI для автоматических миграций

## Установка (уже сделано)

```bash
npm install supabase --save-dev
```

## Первоначальная настройка

### 1. Логин в Supabase

```bash
npx supabase login
```

Откроется браузер для авторизации.

### 2. Связать ваш проект

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

**Где найти project-ref:**
- Откройте ваш проект в Supabase Dashboard
- Посмотрите в URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`
- Или в Settings → General → Reference ID

## Использование

### Выполнить все миграции

```bash
npx supabase db push
```

Это автоматически выполнит все файлы из `supabase/migrations/` в порядке их именования.

### Пересоздать базу (сброс)

```bash
npx supabase db reset
```

⚠️ **ВНИМАНИЕ:** Удалит все данные!

### Проверить статус миграций

```bash
npx supabase migration list
```

## Быстрый старт

После настройки CLI:

```bash
# 1. Сброс (если нужно начать заново)
npx supabase db reset

# 2. Применить миграции
npx supabase db push
```

Все миграции из `supabase/migrations/` будут выполнены автоматически!

---

*Это самый простой способ выполнения миграций автоматически*

