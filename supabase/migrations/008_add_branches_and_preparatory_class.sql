-- Миграция: Добавление поддержки филиалов и подготовительного класса
-- Дата: 2025-12-12

-- 1. Добавить поддержку филиалов в organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Индекс для быстрого поиска филиалов
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_organization_id);

-- Ограничение: организация не может быть своим родителем
ALTER TABLE organizations
  ADD CONSTRAINT organizations_not_self_parent 
  CHECK (parent_organization_id IS NULL OR parent_organization_id != id);

-- 2. Добавить поддержку подготовительного класса (0 класс) в school_details
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS accepts_preparatory BOOLEAN NOT NULL DEFAULT false;

-- Комментарии для документирования
COMMENT ON COLUMN organizations.parent_organization_id IS 'Ссылка на главную организацию, если это филиал. NULL если это главная школа.';
COMMENT ON COLUMN school_details.accepts_preparatory IS 'Принимает ли школа подготовительный класс (0 класс).';
COMMENT ON COLUMN school_details.grade_from IS 'Минимальный класс для приёма (1-11).';
COMMENT ON COLUMN school_details.grade_to IS 'Максимальный класс для приёма (1-11).';

