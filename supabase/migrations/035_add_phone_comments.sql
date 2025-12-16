-- Добавление колонок для комментариев к телефонам в таблицу organizations
-- Дата: 2025-01-XX
-- Описание: Добавляем колонки для комментариев к дополнительным телефонам

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS phone_secondary_comment TEXT,
  ADD COLUMN IF NOT EXISTS phone_admission_comment TEXT;

-- Комментарии для документации
COMMENT ON COLUMN organizations.phone_secondary_comment IS 'Комментарий к дополнительному телефону (например: Приёмная, Директор)';
COMMENT ON COLUMN organizations.phone_admission_comment IS 'Комментарий к телефону приёмной комиссии (например: Приёмная комиссия)';

