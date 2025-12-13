-- Миграция: Добавление индексов для оптимизации производительности
-- Дата: 2025-01-XX
-- Цель: Улучшить скорость запросов для фильтрации школ и получения списков районов/городов

-- 1. Составной индекс для фильтрации школ (самый важный для getSchoolsWithFilters)
-- Покрывает основные фильтры: org_type, status, district, city, overall_rating
CREATE INDEX IF NOT EXISTS idx_organizations_filters_composite 
  ON organizations(org_type, status, district, city, overall_rating DESC NULLS LAST)
  WHERE org_type = 'school' AND status = 'active';

-- 2. Оптимизированный индекс для getDistricts() - частичный индекс
-- Использует WHERE для фильтрации только нужных записей
CREATE INDEX IF NOT EXISTS idx_organizations_districts_filtered
  ON organizations(org_type, status, district)
  WHERE org_type = 'school' AND status = 'active' AND district IS NOT NULL;

-- 3. Оптимизированный индекс для getCities() - частичный индекс
CREATE INDEX IF NOT EXISTS idx_organizations_cities_filtered
  ON organizations(org_type, status, city)
  WHERE org_type = 'school' AND status = 'active' AND city IS NOT NULL;

-- 4. Индекс для JOIN с school_details по organization_id и часто используемым полям
-- Улучшает производительность фильтрации по school_type и primary_language
CREATE INDEX IF NOT EXISTS idx_school_details_filters
  ON school_details(organization_id, school_type, primary_language);

-- 5. Индекс для фильтрации по цене (fee_monthly_min, fee_monthly_max)
-- Улучшает производительность запросов с фильтрами по цене
CREATE INDEX IF NOT EXISTS idx_school_details_fee_filter
  ON school_details(fee_monthly_min, fee_monthly_max)
  WHERE fee_monthly_min IS NOT NULL AND fee_monthly_max IS NOT NULL;

-- 6. Индекс для curriculum (массив) - уже есть GIN индекс, но убедимся что он оптимален
-- GIN индекс уже создан в 001_create_tables.sql, но проверим его наличие
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_school_details_curriculum'
  ) THEN
    CREATE INDEX idx_school_details_curriculum 
      ON school_details USING GIN(curriculum);
  END IF;
END $$;

-- Комментарии для документирования
COMMENT ON INDEX idx_organizations_filters_composite IS 
  'Составной индекс для быстрой фильтрации школ по типу, статусу, району, городу и рейтингу';
COMMENT ON INDEX idx_organizations_districts_filtered IS 
  'Частичный индекс для быстрого получения списка районов';
COMMENT ON INDEX idx_organizations_cities_filtered IS 
  'Частичный индекс для быстрого получения списка городов';
COMMENT ON INDEX idx_school_details_filters IS 
  'Индекс для быстрого JOIN и фильтрации по типу школы и языку';
COMMENT ON INDEX idx_school_details_fee_filter IS 
  'Индекс для быстрой фильтрации по диапазону цен';

