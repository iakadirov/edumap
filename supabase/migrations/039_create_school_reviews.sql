-- Миграция: Создание таблицы для отзывов школ
-- Дата: Декабрь 2025
-- Описание: Таблица для хранения отзывов родителей и учеников о школах

CREATE TABLE school_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Автор отзыва
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL, -- 'parent', 'student', 'alumni', 'teacher'
  author_avatar_url TEXT,
  is_verified_parent BOOLEAN DEFAULT false,
  
  -- Рейтинг
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  ratings JSONB, -- {quality: 4.5, teachers: 5.0, infrastructure: 4.0, meals: 3.5, communication: 4.5}
  
  -- Содержимое отзыва
  content TEXT NOT NULL,
  pros TEXT[], -- Плюсы школы
  cons TEXT[], -- Минусы школы
  
  -- Взаимодействие
  helpful_count INTEGER DEFAULT 0,
  
  -- Ответ школы
  school_response TEXT,
  school_response_date TIMESTAMPTZ,
  
  -- Метаданные
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_school_reviews_organization_id ON school_reviews(organization_id);
CREATE INDEX idx_school_reviews_rating ON school_reviews(rating);
CREATE INDEX idx_school_reviews_created_at ON school_reviews(created_at DESC);
CREATE INDEX idx_school_reviews_organization_rating ON school_reviews(organization_id, rating);
CREATE INDEX idx_school_reviews_helpful_count ON school_reviews(helpful_count DESC);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_school_reviews_updated_at
  BEFORE UPDATE ON school_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии
COMMENT ON TABLE school_reviews IS 'Отзывы о школах от родителей, учеников и выпускников';
COMMENT ON COLUMN school_reviews.rating IS 'Общий рейтинг от 1 до 5';
COMMENT ON COLUMN school_reviews.ratings IS 'Детальные рейтинги по категориям: quality, teachers, infrastructure, meals, communication';
COMMENT ON COLUMN school_reviews.author_role IS 'Роль автора: parent (родитель), student (ученик), alumni (выпускник), teacher (учитель)';
COMMENT ON COLUMN school_reviews.is_verified_parent IS 'Верифицирован ли родитель (подтверждена связь со школой)';
COMMENT ON COLUMN school_reviews.helpful_count IS 'Количество отметок "Полезно" от других пользователей';

