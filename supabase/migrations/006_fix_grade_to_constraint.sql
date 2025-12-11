-- Миграция: Исправление constraint для grade_to
-- Дата: 2025-12-12
-- Проблема: Column-level CHECK не может сравнивать grade_to >= grade_from
-- Решение: Используем table-level constraint

-- Удаляем старый constraint на grade_to (который пытается сравнить столбцы)
ALTER TABLE school_details 
  DROP CONSTRAINT IF EXISTS school_details_grade_to_check;

-- Добавляем table-level constraint для проверки grade_range
ALTER TABLE school_details
  ADD CONSTRAINT grade_range_check CHECK (grade_to >= grade_from);

