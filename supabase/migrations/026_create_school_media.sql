-- Миграция: Создание таблицы для медиа-файлов школ
-- Дата: Декабрь 2025
-- Описание: Таблица для хранения фотографий и видео школ

CREATE TABLE school_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  category TEXT, -- для фото: 'exterior', 'classrooms', 'labs', 'sports', 'cafeteria', 'events', 'library'
  caption TEXT,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_school_media_organization_id ON school_media(organization_id);
CREATE INDEX idx_school_media_type ON school_media(type);
CREATE INDEX idx_school_media_category ON school_media(category);
CREATE INDEX idx_school_media_is_cover ON school_media(is_cover) WHERE is_cover = true;

-- Уникальное ограничение: только одна обложка на школу
CREATE UNIQUE INDEX idx_school_media_cover_unique 
  ON school_media(organization_id) 
  WHERE is_cover = true;

-- Комментарии
COMMENT ON TABLE school_media IS 'Медиа-файлы школ (фотографии и видео)';
COMMENT ON COLUMN school_media.type IS 'Тип медиа: photo (фото) или video (видео)';
COMMENT ON COLUMN school_media.category IS 'Категория фото: exterior, classrooms, labs, sports, cafeteria, events, library';
COMMENT ON COLUMN school_media.is_cover IS 'Является ли медиа обложкой школы (отображается в карточке)';
COMMENT ON COLUMN school_media.sort_order IS 'Порядок сортировки медиа-файлов';

