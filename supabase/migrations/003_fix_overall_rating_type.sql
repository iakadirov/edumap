-- Миграция: Исправление типа поля overall_rating
-- Дата: 2025-12-12
-- Проблема: DECIMAL(3,2) может хранить только значения до 9.99, но нам нужны до 100.00

-- Изменяем тип поля overall_rating на DECIMAL(5,2)
ALTER TABLE organizations
ALTER COLUMN overall_rating TYPE DECIMAL(5, 2);