-- Миграция: Создание таблицы school_brands для сетевых школ
-- Дата: 2025-01-XX
-- Описание: Добавляем систему брендов для группировки школ

-- Создание таблицы school_brands
CREATE TABLE school_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  founder TEXT,
  description TEXT,
  founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW()) + 10),
  phone TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Добавление поля brand_id в таблицу organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES school_brands(id) ON DELETE SET NULL;

-- Индексы для school_brands
CREATE INDEX idx_school_brands_slug ON school_brands(slug);
CREATE INDEX idx_school_brands_name ON school_brands(name);

-- Индекс для organizations.brand_id
CREATE INDEX IF NOT EXISTS idx_organizations_brand_id ON organizations(brand_id);

-- Триггер для обновления updated_at в school_brands
CREATE TRIGGER update_school_brands_updated_at
  BEFORE UPDATE ON school_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии для документации
COMMENT ON TABLE school_brands IS 'Таблица брендов для сетевых школ';
COMMENT ON COLUMN school_brands.slug IS 'URL-friendly идентификатор бренда (например: registon)';
COMMENT ON COLUMN school_brands.founder IS 'Основатель бренда';
COMMENT ON COLUMN organizations.brand_id IS 'Связь с брендом школы (опционально)';

