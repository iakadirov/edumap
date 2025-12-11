-- Миграция: Исправление constraint для fee_monthly_max
-- Дата: 2025-12-12
-- Проблема: Column-level CHECK не может сравнивать два столбца в одной строке
-- Решение: Используем table-level constraint

-- Удаляем старый constraint на fee_monthly_max
ALTER TABLE school_details 
  DROP CONSTRAINT IF EXISTS school_details_fee_monthly_max_check;

-- Добавляем table-level constraint для проверки fee_range
ALTER TABLE school_details
  ADD CONSTRAINT fee_range_check CHECK (
    (fee_monthly_min IS NULL AND fee_monthly_max IS NULL) OR
    (fee_monthly_min IS NOT NULL AND fee_monthly_max IS NOT NULL AND fee_monthly_max >= fee_monthly_min) OR
    (fee_monthly_min IS NOT NULL AND fee_monthly_max IS NULL) OR
    (fee_monthly_min IS NULL AND fee_monthly_max IS NOT NULL)
  );

