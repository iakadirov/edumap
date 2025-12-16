-- Добавление поля для тарифов по классам
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS pricing_tiers JSONB;

-- Добавление поля для сохранения выбранных классов приёма
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS accepted_grades INTEGER[];

-- Комментарии для документации
COMMENT ON COLUMN school_details.pricing_tiers IS 'Тарифы по классам: [{"grades": [1,2,3], "price": 3000000}, {"grades": [4,5,6], "price": 4000000}]';
COMMENT ON COLUMN school_details.accepted_grades IS 'Классы приёма: [0,1,2,3,4,5,6,7,8,9,10,11] где 0 - подготовительный класс';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_school_details_pricing_tiers ON school_details USING GIN(pricing_tiers);
CREATE INDEX IF NOT EXISTS idx_school_details_accepted_grades ON school_details USING GIN(accepted_grades);

