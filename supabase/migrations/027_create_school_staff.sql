-- Миграция: Создание таблицы для педагогического состава
-- Дата: Декабрь 2025
-- Описание: Таблица для хранения информации о педагогическом составе школы

CREATE TABLE school_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'director', 'deputy_director', 'teacher', etc.
  photo_url TEXT,
  experience_years INTEGER,
  education TEXT,
  certifications TEXT[],
  bio TEXT, -- Краткая биография
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_school_staff_organization_id ON school_staff(organization_id);
CREATE INDEX idx_school_staff_position ON school_staff(position);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_school_staff_updated_at
  BEFORE UPDATE ON school_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии
COMMENT ON TABLE school_staff IS 'Педагогический состав школы (руководители и ключевые сотрудники)';
COMMENT ON COLUMN school_staff.position IS 'Должность: director, deputy_director, head_teacher, teacher и т.д.';

