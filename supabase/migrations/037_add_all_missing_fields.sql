-- Объединенная миграция: Добавление всех недостающих полей
-- Дата: 2025-01-XX
-- Описание: Добавляем все поля, необходимые для работы форм редактирования и добавления школ

-- ============================================
-- 1. organizations: Добавление полей
-- ============================================

-- Добавление колонки banner_url
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Добавление колонок для комментариев к телефонам
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS phone_secondary_comment TEXT,
  ADD COLUMN IF NOT EXISTS phone_admission_comment TEXT;

-- Комментарии для organizations
COMMENT ON COLUMN organizations.banner_url IS 'URL баннера школы (отдельно от cover_image_url для обратной совместимости)';
COMMENT ON COLUMN organizations.phone_secondary_comment IS 'Комментарий к дополнительному телефону (например: Приёмная, Директор)';
COMMENT ON COLUMN organizations.phone_admission_comment IS 'Комментарий к телефону приёмной комиссии (например: Приёмная комиссия)';

-- ============================================
-- 2. school_details: Добавление полей
-- ============================================

-- Добавление поля для тарифов по классам
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;

-- Добавление поля для сохранения выбранных классов приёма
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS accepted_grades INTEGER[];

-- Комментарии для school_details
COMMENT ON COLUMN school_details.pricing_tiers IS 'Тарифы по классам: [{"grades": [1,2,3], "price": 3000000}, {"grades": [4,5,6], "price": 4000000}]';
COMMENT ON COLUMN school_details.accepted_grades IS 'Классы приёма: [0,1,2,3,4,5,6,7,8,9,10,11] где 0 - подготовительный класс';

-- Индексы для school_details
CREATE INDEX IF NOT EXISTS idx_school_details_pricing_tiers ON school_details USING GIN(pricing_tiers);
CREATE INDEX IF NOT EXISTS idx_school_details_accepted_grades ON school_details USING GIN(accepted_grades);

