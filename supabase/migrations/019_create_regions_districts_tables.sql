-- Миграция: Создание нормализованных таблиц regions и districts
-- Дата: 2025-12-26
-- Описание: Создание справочных таблиц для административно-территориального деления
--           1-й уровень: 14 областей/республика/город
--           2-й уровень: ~2641 районов и городов областного подчинения

-- ============================================================================
-- 1. ТАБЛИЦА REGIONS (1-й уровень: области, республика, город)
-- ============================================================================

CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY,                    -- ID из репозитория uzbekistan-regions-data
  soato_id INTEGER UNIQUE NOT NULL,          -- SOATO код (стандарт Узбекистана)
  name_uz TEXT NOT NULL,                     -- Название на узбекском (латиница)
  name_oz TEXT,                              -- Название на узбекском (кириллица)
  name_ru TEXT NOT NULL,                     -- Название на русском
  region_type TEXT NOT NULL CHECK (           -- Тип: область, республика, город
    region_type IN ('viloyat', 'respublika', 'shahar')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_regions_soato ON regions(soato_id);
CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(region_type);
CREATE INDEX IF NOT EXISTS idx_regions_name_uz ON regions(name_uz);
CREATE INDEX IF NOT EXISTS idx_regions_name_ru ON regions(name_ru);

-- Комментарии
COMMENT ON TABLE regions IS 'Области, республика и город центрального подчинения (1-й уровень АТД Узбекистана)';
COMMENT ON COLUMN regions.id IS 'ID из репозитория uzbekistan-regions-data';
COMMENT ON COLUMN regions.soato_id IS 'SOATO код (Система обозначения административно-территориальных единиц)';
COMMENT ON COLUMN regions.region_type IS 'Тип: viloyat (область), respublika (республика), shahar (город центрального подчинения)';

-- ============================================================================
-- 2. ТАБЛИЦА DISTRICTS (2-й уровень: районы, города областного подчинения)
-- ============================================================================

CREATE TABLE IF NOT EXISTS districts (
  id INTEGER PRIMARY KEY,                    -- ID из репозитория
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  soato_id INTEGER UNIQUE NOT NULL,          -- SOATO код
  name_uz TEXT NOT NULL,                     -- Название на узбекском (латиница)
  name_oz TEXT,                              -- Название на узбекском (кириллица)
  name_ru TEXT NOT NULL,                     -- Название на русском
  district_type TEXT NOT NULL CHECK (        -- Тип: район, город областного подчинения
    district_type IN ('tuman', 'shahar')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_districts_region ON districts(region_id);
CREATE INDEX IF NOT EXISTS idx_districts_soato ON districts(soato_id);
CREATE INDEX IF NOT EXISTS idx_districts_type ON districts(district_type);
CREATE INDEX IF NOT EXISTS idx_districts_name_uz ON districts(name_uz);
CREATE INDEX IF NOT EXISTS idx_districts_name_ru ON districts(name_ru);

-- Комментарии
COMMENT ON TABLE districts IS 'Районы и города областного подчинения (2-й уровень АТД Узбекистана)';
COMMENT ON COLUMN districts.region_id IS 'Ссылка на область/республику/город';
COMMENT ON COLUMN districts.district_type IS 'Тип: tuman (район), shahar (город областного подчинения)';

-- ============================================================================
-- 3. ОБНОВЛЕНИЕ ТАБЛИЦЫ ORGANIZATIONS
-- ============================================================================

-- Добавляем связи с нормализованными таблицами
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_organizations_region_id ON organizations(region_id);
CREATE INDEX IF NOT EXISTS idx_organizations_district_id ON organizations(district_id);

-- Композитный индекс для фильтрации по области и району
CREATE INDEX IF NOT EXISTS idx_organizations_region_district 
  ON organizations(region_id, district_id) 
  WHERE org_type = 'school' AND status = 'active';

-- Комментарии
COMMENT ON COLUMN organizations.region_id IS 'Ссылка на нормализованную таблицу regions (приоритет над текстовым полем region)';
COMMENT ON COLUMN organizations.district_id IS 'Ссылка на нормализованную таблицу districts (приоритет над текстовым полем district)';

-- ============================================================================
-- 4. ФУНКЦИИ ДЛЯ МАППИНГА (помогают при миграции данных)
-- ============================================================================

-- Функция для поиска region_id по текстовому названию
CREATE OR REPLACE FUNCTION find_region_id(region_name TEXT)
RETURNS INTEGER AS $$
  SELECT id FROM regions 
  WHERE name_uz ILIKE '%' || TRIM(region_name) || '%'
     OR name_ru ILIKE '%' || TRIM(region_name) || '%'
     OR name_oz ILIKE '%' || TRIM(region_name) || '%'
  ORDER BY 
    CASE WHEN name_uz ILIKE TRIM(region_name) || '%' THEN 1 ELSE 2 END,
    CASE WHEN name_ru ILIKE TRIM(region_name) || '%' THEN 1 ELSE 2 END
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Функция для поиска district_id по текстовому названию (с учетом области)
CREATE OR REPLACE FUNCTION find_district_id(district_name TEXT, org_region_id INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
  SELECT id FROM districts 
  WHERE (org_region_id IS NULL OR region_id = org_region_id)
    AND (
      name_uz ILIKE '%' || TRIM(district_name) || '%'
      OR name_ru ILIKE '%' || TRIM(district_name) || '%'
      OR name_oz ILIKE '%' || TRIM(district_name) || '%'
    )
  ORDER BY 
    CASE WHEN org_region_id IS NOT NULL AND region_id = org_region_id THEN 1 ELSE 2 END,
    CASE WHEN name_uz ILIKE TRIM(district_name) || '%' THEN 1 ELSE 2 END,
    CASE WHEN name_ru ILIKE TRIM(district_name) || '%' THEN 1 ELSE 2 END
  LIMIT 1;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION find_region_id IS 'Поиск ID области по текстовому названию (для миграции)';
COMMENT ON FUNCTION find_district_id IS 'Поиск ID района по текстовому названию с учетом области (для миграции)';

