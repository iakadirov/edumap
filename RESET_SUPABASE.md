# Инструкция: Пересоздание таблиц в Supabase

## ⚠️ ВНИМАНИЕ
Это удалит все данные из таблиц! Используйте только если нужно начать заново.

## Шаги

### 1. Очистка таблиц

1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое файла `supabase/migrations/000_reset_tables.sql`
3. Выполните SQL (Run)
4. Проверьте, что таблицы удалены

### 2. Создание таблиц заново

1. В том же SQL Editor
2. Скопируйте содержимое файла `supabase/migrations/001_create_tables_final.sql`
3. Выполните SQL (Run)
4. Должно быть: "Success. No rows returned"

### 3. Проверка

1. Перейдите в Table Editor
2. Должны появиться таблицы:
   - `organizations`
   - `school_details`

### 4. Добавление тестовых данных

1. В SQL Editor
2. Скопируйте содержимое файла `supabase/migrations/002_insert_test_schools.sql`
3. Выполните SQL (Run)
4. Должно быть: "Success. 10 rows inserted" (5 организаций + 5 деталей)

### 5. Проверка данных

1. В Table Editor → `organizations`
2. Должно быть 5 школ
3. В Table Editor → `school_details`
4. Должно быть 5 записей с деталями

## Если что-то пошло не так

Если возникли ошибки:
1. Выполните `000_reset_tables.sql` снова
2. Проверьте ошибки в `001_create_tables_final.sql`
3. Убедитесь, что все constraints правильно настроены

## Альтернатива: через Supabase CLI

Если у вас установлен Supabase CLI:

```bash
# Сброс локальной БД (если используете локальный Supabase)
npx supabase db reset

# Или применить миграции
npx supabase migration up
```

---

*Все исправления включены в финальную версию миграции*

