-- Миграция: Исправление ограничений для grade_from и grade_to
-- Дата: 2025-12-12
-- Проблема: CHECK constraint ограничивал grade_to до 11, но международные школы могут иметь 12 классов

-- Удаляем старые constraints
ALTER TABLE school_details 
  DROP CONSTRAINT IF EXISTS school_details_grade_from_check;
ALTER TABLE school_details 
  DROP CONSTRAINT IF EXISTS school_details_grade_to_check;

-- Добавляем новые constraints с поддержкой до 12 классов
ALTER TABLE school_details 
  ADD CONSTRAINT school_details_grade_from_check 
  CHECK (grade_from >= 1 AND grade_from <= 12);

ALTER TABLE school_details 
  ADD CONSTRAINT school_details_grade_to_check 
  CHECK (grade_to >= 1 AND grade_to <= 12 AND grade_to >= grade_from);

