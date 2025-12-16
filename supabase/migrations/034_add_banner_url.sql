-- Добавление колонки banner_url в таблицу organizations
-- Дата: 2025-01-XX
-- Описание: Добавляем колонку banner_url для хранения URL баннера школы

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Комментарий для документации
COMMENT ON COLUMN organizations.banner_url IS 'URL баннера школы (отдельно от cover_image_url для обратной совместимости)';

