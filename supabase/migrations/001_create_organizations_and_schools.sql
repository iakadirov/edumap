-- Миграция: Создание таблиц organizations и school_details
-- Дата: 2025-12-12

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_type TEXT NOT NULL CHECK (org_type IN ('school', 'university', 'kindergarten', 'center', 'course')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  district TEXT,
  city TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  overall_rating DECIMAL(3, 2) CHECK (overall_rating >= 0 AND overall_rating <= 100),
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для organizations
CREATE INDEX IF NOT EXISTS idx_organizations_org_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_district ON organizations(district);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_rating ON organizations(overall_rating DESC);

-- Триггер для обновления updated_at в organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Создание таблицы school_details
CREATE TABLE IF NOT EXISTS school_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  school_type TEXT NOT NULL CHECK (school_type IN ('private', 'state', 'international')),
  grade_from INTEGER NOT NULL CHECK (grade_from >= 1 AND grade_from <= 11),
  grade_to INTEGER NOT NULL CHECK (grade_to >= 1 AND grade_to <= 11 AND grade_to >= grade_from),
  total_students INTEGER CHECK (total_students > 0),
  avg_class_size INTEGER CHECK (avg_class_size > 0),
  primary_language TEXT NOT NULL DEFAULT 'uzbek',
  additional_languages TEXT[],
  curriculum TEXT[] CHECK (
    curriculum <@ ARRAY['national', 'cambridge', 'ib']::TEXT[]
  ),
  fee_monthly_min DECIMAL(10, 2) CHECK (fee_monthly_min >= 0),
  fee_monthly_max DECIMAL(10, 2) CHECK (fee_monthly_max >= 0 AND fee_monthly_max >= fee_monthly_min),
  has_transport BOOLEAN NOT NULL DEFAULT false,
  has_meals BOOLEAN NOT NULL DEFAULT false,
  has_extended_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Индексы для school_details
CREATE INDEX IF NOT EXISTS idx_school_details_organization_id ON school_details(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_details_school_type ON school_details(school_type);
CREATE INDEX IF NOT EXISTS idx_school_details_curriculum ON school_details USING GIN(curriculum);
CREATE INDEX IF NOT EXISTS idx_school_details_fee_range ON school_details(fee_monthly_min, fee_monthly_max);

-- Триггер для обновления updated_at в school_details
CREATE TRIGGER update_school_details_updated_at
  BEFORE UPDATE ON school_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_details ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать активные организации
CREATE POLICY "Anyone can view active organizations"
  ON organizations
  FOR SELECT
  USING (status = 'active');

-- Политика: все могут читать детали активных школ
CREATE POLICY "Anyone can view active school details"
  ON school_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = school_details.organization_id
      AND organizations.status = 'active'
    )
  );

