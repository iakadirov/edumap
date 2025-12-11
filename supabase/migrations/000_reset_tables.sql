-- Миграция: Очистка таблиц (используйте для пересоздания)
-- ВНИМАНИЕ: Это удалит все данные!

-- Удаляем таблицы в правильном порядке (сначала зависимые)
DROP TABLE IF EXISTS school_details CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Удаляем функцию, если она существует
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

