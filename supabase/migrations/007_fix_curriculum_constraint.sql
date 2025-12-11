-- Миграция: Исправление constraint для curriculum
-- Дата: 2025-12-12
-- Проблема: Constraint на curriculum может не правильно обрабатывать NULL или пустые массивы

-- Удаляем старый constraint на curriculum
ALTER TABLE school_details 
  DROP CONSTRAINT IF EXISTS school_details_curriculum_check;

-- Добавляем новый constraint, который правильно обрабатывает NULL
ALTER TABLE school_details
  ADD CONSTRAINT school_details_curriculum_check CHECK (
    curriculum IS NULL OR 
    curriculum = '{}' OR
    curriculum <@ ARRAY['national', 'cambridge', 'ib']::TEXT[]
  );

