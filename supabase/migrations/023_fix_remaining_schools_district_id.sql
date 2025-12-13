-- Миграция: Исправление district_id для оставшихся школ
-- Дата: 2025-12-13
-- Описание: Обновляет district_id для старых тестовых школ

-- 1. Registon maktabi Andijon filiali (Андижан, Центральный)
UPDATE organizations
SET district_id = (
    SELECT id FROM districts 
    WHERE region_id = 2 
    AND soato_id = 1703401 
    AND district_type = 'shahar'
    LIMIT 1
)
WHERE slug = 'registon-maktabi-andijon';

-- 2. Registon maktabi Namangan filiali (Наманган, Центральный)
UPDATE organizations
SET district_id = (
    SELECT id FROM districts 
    WHERE region_id = 7 
    AND soato_id = 1710401 
    AND district_type = 'shahar'
    LIMIT 1
)
WHERE slug = 'registon-maktabi-namangan';

-- 3. Registon (Ташкент, Яшнабадский район)
UPDATE organizations
SET district_id = (
    SELECT id FROM districts 
    WHERE region_id = 11 
    AND soato_id = 1726290 
    AND district_type = 'tuman'
    LIMIT 1
)
WHERE slug = 'registon-maktabi' AND district_id IS NULL;

-- Проверка результата
DO $$
DECLARE
    total_count INTEGER;
    with_district_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count 
    FROM organizations 
    WHERE org_type = 'school' AND status = 'active';
    
    SELECT COUNT(*) INTO with_district_id 
    FROM organizations 
    WHERE org_type = 'school' 
    AND status = 'active' 
    AND district_id IS NOT NULL;

    RAISE NOTICE '=== Результат обновления ===';
    RAISE NOTICE 'Всего активных школ: %', total_count;
    RAISE NOTICE 'С district_id: % (%)', with_district_id, ROUND(with_district_id::NUMERIC / NULLIF(total_count, 0) * 100, 1);
END $$;

