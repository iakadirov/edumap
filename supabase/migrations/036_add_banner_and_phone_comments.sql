-- Объединенная миграция: Добавление banner_url и комментариев к телефонам
-- Дата: 2025-01-XX
-- Описание: Добавляем колонки для баннера и комментариев к телефонам

-- Добавление колонки banner_url
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Добавление колонок для комментариев к телефонам
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS phone_secondary_comment TEXT,
  ADD COLUMN IF NOT EXISTS phone_admission_comment TEXT;

-- Комментарии для документации
COMMENT ON COLUMN organizations.banner_url IS 'URL баннера школы (отдельно от cover_image_url для обратной совместимости)';
COMMENT ON COLUMN organizations.phone_secondary_comment IS 'Комментарий к дополнительному телефону (например: Приёмная, Директор)';
COMMENT ON COLUMN organizations.phone_admission_comment IS 'Комментарий к телефону приёмной комиссии (например: Приёмная комиссия)';

