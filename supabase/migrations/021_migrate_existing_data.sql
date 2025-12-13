-- Миграция: Заполнение region_id и district_id для существующих записей
-- Дата: 2025-12-26
-- Описание: Миграция существующих текстовых значений region и district к нормализованным ID

-- ============================================================================
-- ШАГ 1: Заполнение region_id на основе city и текстового region
-- ============================================================================

-- Ташкентские школы → Toshkent shahri (id = 11)
UPDATE organizations
SET region_id = 11
WHERE city = 'Ташкент'
  AND district IN (
    'Мирабадский', 'Юнусабадский', 'Шайхантахурский', 
    'Чиланзарский', 'Учтепинский', 'Центральный', 'Яшнабадский',
    'Яккасарайский', 'Мирзо-Улугбекский', 'Олмазорский', 
    'Алмазарский', 'Сергелийский', 'Бектемирский'
  )
  AND region_id IS NULL;

-- Андижан → Andijon viloyati (id = 2)
UPDATE organizations
SET region_id = 2
WHERE city = 'Андижан'
  AND region_id IS NULL;

-- Наманган → Namangan viloyati (id = 7)
UPDATE organizations
SET region_id = 7
WHERE city = 'Наманган'
  AND region_id IS NULL;

-- Используем функцию поиска для остальных случаев
UPDATE organizations
SET region_id = find_region_id(COALESCE(region, city))
WHERE region_id IS NULL
  AND (region IS NOT NULL OR city IS NOT NULL);

-- ============================================================================
-- ШАГ 2: Заполнение district_id на основе текстового district
-- ============================================================================

-- Сначала обновляем записи с известным region_id
UPDATE organizations o
SET district_id = find_district_id(o.district, o.region_id)
WHERE o.district_id IS NULL
  AND o.district IS NOT NULL
  AND o.region_id IS NOT NULL;

-- Затем для записей без region_id (менее точно)
UPDATE organizations o
SET district_id = find_district_id(o.district, NULL)
WHERE o.district_id IS NULL
  AND o.district IS NOT NULL;

-- ============================================================================
-- ШАГ 3: Статистика миграции
-- ============================================================================

-- Проверяем результаты
DO $$
DECLARE
  total_count INTEGER;
  with_region_id INTEGER;
  with_district_id INTEGER;
  with_both INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM organizations WHERE org_type = 'school' AND status = 'active';
  SELECT COUNT(*) INTO with_region_id FROM organizations WHERE org_type = 'school' AND status = 'active' AND region_id IS NOT NULL;
  SELECT COUNT(*) INTO with_district_id FROM organizations WHERE org_type = 'school' AND status = 'active' AND district_id IS NOT NULL;
  SELECT COUNT(*) INTO with_both FROM organizations WHERE org_type = 'school' AND status = 'active' AND region_id IS NOT NULL AND district_id IS NOT NULL;
  
  RAISE NOTICE '=== Статистика миграции ===';
  RAISE NOTICE 'Всего активных школ: %', total_count;
  RAISE NOTICE 'С region_id: % (%)', with_region_id, ROUND(with_region_id::NUMERIC / NULLIF(total_count, 0) * 100, 1);
  RAISE NOTICE 'С district_id: % (%)', with_district_id, ROUND(with_district_id::NUMERIC / NULLIF(total_count, 0) * 100, 1);
  RAISE NOTICE 'С обоими: % (%)', with_both, ROUND(with_both::NUMERIC / NULLIF(total_count, 0) * 100, 1);
END $$;

