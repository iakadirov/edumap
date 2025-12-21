-- Миграция: Добавление полей в school_brands для автозаполнения школ
-- Дата: 2025-01-XX
-- Описание: Добавляем поля banner_url, short_description и telegram для автозаполнения данных школ из бренда

-- Добавляем поля в таблицу school_brands
ALTER TABLE school_brands
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS telegram TEXT;

-- Комментарии для документации
COMMENT ON COLUMN school_brands.banner_url IS 'URL баннера/обложки бренда для автозаполнения в школах';
COMMENT ON COLUMN school_brands.cover_image_url IS 'URL обложки бренда (альтернативное название для banner_url)';
COMMENT ON COLUMN school_brands.short_description IS 'Краткое описание бренда (до 160 символов) для автозаполнения в школах';
COMMENT ON COLUMN school_brands.telegram IS 'Telegram контакт бренда для автозаполнения в школах';

