-- Миграция: Создание таблицы для отслеживания прогресса разделов
-- Дата: Декабрь 2025
-- Описание: Таблица для хранения прогресса заполнения разделов профиля школы

CREATE TABLE school_sections_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN (
    'basic', 'education', 'teachers', 'infrastructure', 'services',
    'results', 'admission', 'finance', 'documents', 'photos', 'videos'
  )),
  completeness INTEGER NOT NULL DEFAULT 0 CHECK (completeness >= 0 AND completeness <= 100),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, section)
);

-- Индексы для производительности
CREATE INDEX idx_school_sections_progress_organization_id ON school_sections_progress(organization_id);
CREATE INDEX idx_school_sections_progress_section ON school_sections_progress(section);

-- Триггер для автоматического обновления last_updated_at
CREATE TRIGGER update_school_sections_progress_updated_at
  BEFORE UPDATE ON school_sections_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии
COMMENT ON TABLE school_sections_progress IS 'Прогресс заполнения разделов профиля школы (0-100%)';
COMMENT ON COLUMN school_sections_progress.section IS 'Раздел: basic, education, teachers, infrastructure, services, results, admission, finance, documents, photos, videos';
COMMENT ON COLUMN school_sections_progress.completeness IS 'Процент заполненности раздела (0-100)';

