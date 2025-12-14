-- Миграция: Создание таблицы для результатов и достижений школ
-- Дата: Декабрь 2025
-- Описание: Таблица для хранения результатов выпускников, экзаменов и достижений по годам

CREATE TABLE school_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  
  -- Результаты выпускников
  total_graduates INTEGER,
  graduates_to_universities INTEGER,
  graduates_on_grants INTEGER,
  graduates_to_top_uz_universities INTEGER,
  graduates_to_foreign_universities INTEGER,
  top_universities_uz TEXT[], -- Список топ-вузов Узбекистана
  foreign_universities TEXT[], -- Список зарубежных вузов
  
  -- Результаты экзаменов
  avg_dtm_score DECIMAL(5,2), -- Средний балл DTM (0-100)
  avg_ielts_score DECIMAL(3,1), -- Средний балл IELTS (0-9.0)
  avg_sat_score INTEGER, -- Средний балл SAT (400-1600)
  students_with_ielts_7plus INTEGER, -- Количество учеников с IELTS 7.0+
  students_with_ielts_8plus INTEGER, -- Количество учеников с IELTS 8.0+
  
  -- Олимпиады
  olympiad_medals_international INTEGER DEFAULT 0,
  olympiad_medals_national INTEGER DEFAULT 0,
  olympiad_medals_city INTEGER DEFAULT 0,
  olympiad_subjects TEXT[], -- Предметы олимпиад: 'mathematics', 'physics', 'informatics', etc.
  
  -- Награды школы
  school_awards JSONB, -- [{year, title, organization}]
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, year)
);

-- Индексы для производительности
CREATE INDEX idx_school_results_organization_id ON school_results(organization_id);
CREATE INDEX idx_school_results_year ON school_results(year);
CREATE INDEX idx_school_results_organization_year ON school_results(organization_id, year DESC);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_school_results_updated_at
  BEFORE UPDATE ON school_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии
COMMENT ON TABLE school_results IS 'Результаты и достижения школы по годам';
COMMENT ON COLUMN school_results.top_universities_uz IS 'Топ-вузы Узбекистана, куда поступили выпускники (UWED, Westminster, etc.)';
COMMENT ON COLUMN school_results.foreign_universities IS 'Зарубежные вузы, куда поступили выпускники';
COMMENT ON COLUMN school_results.olympiad_subjects IS 'Предметы олимпиад: mathematics, physics, informatics, chemistry, biology, languages';

