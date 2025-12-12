-- Миграция: Добавление приоритетных полей Phase 2
-- Дата: 2025-12-12
-- Описание: Добавляем самые важные поля из DATA_SCHEMA.md

-- 1. organizations: Расширение базовой информации
ALTER TABLE organizations
  -- Многоязычность и описание
  ADD COLUMN IF NOT EXISTS name_uz TEXT,
  ADD COLUMN IF NOT EXISTS name_ru TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT, -- Краткое описание до 160 символов
  -- Дополнительная информация
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW()) + 10),
  ADD COLUMN IF NOT EXISTS motto TEXT,
  -- Улучшение локации
  ADD COLUMN IF NOT EXISTS region TEXT, -- Область (Ташкент, Андижан, и т.д.)
  ADD COLUMN IF NOT EXISTS landmark TEXT, -- Ориентир ("Рядом с метро...")
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS yandex_maps_url TEXT,
  -- Расширение контактов
  ADD COLUMN IF NOT EXISTS phone_secondary TEXT,
  ADD COLUMN IF NOT EXISTS phone_admission TEXT,
  ADD COLUMN IF NOT EXISTS email_admission TEXT,
  ADD COLUMN IF NOT EXISTS telegram TEXT,
  -- Социальные сети (приоритетные)
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS telegram_channel TEXT,
  ADD COLUMN IF NOT EXISTS youtube TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT;

-- Переименование phone -> phone_primary (если нужно, но лучше оставить обратную совместимость)
-- Оставляем phone как основной, phone_primary можно добавить позже

-- Комментарии для документирования
COMMENT ON COLUMN organizations.name_uz IS 'Название школы на узбекском языке';
COMMENT ON COLUMN organizations.name_ru IS 'Название школы на русском языке';
COMMENT ON COLUMN organizations.short_description IS 'Краткое описание для карточек и превью (до 160 символов)';
COMMENT ON COLUMN organizations.region IS 'Область (Ташкент, Андижан, Самарканд, и т.д.)';
COMMENT ON COLUMN organizations.landmark IS 'Ориентир для навигации ("Рядом с метро Космонавтов")';

-- Индексы для новых полей поиска
CREATE INDEX IF NOT EXISTS idx_organizations_region ON organizations(region);
CREATE INDEX IF NOT EXISTS idx_organizations_founded_year ON organizations(founded_year);

-- 2. school_details: Расширение деталей

-- Расписание и режим работы
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS school_start_time TIME, -- Время начала занятий (например 08:30)
  ADD COLUMN IF NOT EXISTS school_end_time TIME, -- Время окончания (например 15:00)
  ADD COLUMN IF NOT EXISTS lesson_duration INTEGER CHECK (lesson_duration > 0 AND lesson_duration <= 120), -- Длительность урока в минутах
  ADD COLUMN IF NOT EXISTS lessons_per_day INTEGER CHECK (lessons_per_day > 0 AND lessons_per_day <= 12), -- Количество уроков в день
  ADD COLUMN IF NOT EXISTS has_saturday_classes BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extended_day_until TIME; -- Продленка до (например 18:00)

-- Педагогический состав (базовые метрики)
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS total_teachers INTEGER CHECK (total_teachers > 0),
  ADD COLUMN IF NOT EXISTS teachers_with_higher_ed_percent DECIMAL(5,2) CHECK (teachers_with_higher_ed_percent >= 0 AND teachers_with_higher_ed_percent <= 100),
  ADD COLUMN IF NOT EXISTS avg_teacher_experience_years DECIMAL(4,1) CHECK (avg_teacher_experience_years >= 0),
  ADD COLUMN IF NOT EXISTS has_foreign_teachers BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS native_english_speakers_count INTEGER CHECK (native_english_speakers_count >= 0);

-- Инфраструктура (основные объекты)
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS school_area_sqm DECIMAL(10,2) CHECK (school_area_sqm > 0),
  ADD COLUMN IF NOT EXISTS classrooms_count INTEGER CHECK (classrooms_count > 0),
  ADD COLUMN IF NOT EXISTS has_gym BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_swimming_pool BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_football_field BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_library BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_computer_lab BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_science_labs BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_medical_room BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_cafeteria BOOLEAN NOT NULL DEFAULT false;

-- Безопасность
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS has_security_24_7 BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_cctv BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_psychologist BOOLEAN NOT NULL DEFAULT false;

-- Финансовые детали
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS entrance_fee DECIMAL(10,2) CHECK (entrance_fee >= 0),
  ADD COLUMN IF NOT EXISTS textbook_fee_yearly DECIMAL(10,2) CHECK (textbook_fee_yearly >= 0),
  ADD COLUMN IF NOT EXISTS uniform_fee DECIMAL(10,2) CHECK (uniform_fee >= 0),
  ADD COLUMN IF NOT EXISTS meal_fee_monthly DECIMAL(10,2) CHECK (meal_fee_monthly >= 0),
  ADD COLUMN IF NOT EXISTS transport_fee_monthly DECIMAL(10,2) CHECK (transport_fee_monthly >= 0),
  ADD COLUMN IF NOT EXISTS has_sibling_discount BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sibling_discount_percent INTEGER CHECK (sibling_discount_percent >= 0 AND sibling_discount_percent <= 100);

-- Документы и лицензии
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS license_date DATE,
  ADD COLUMN IF NOT EXISTS license_valid_until DATE,
  ADD COLUMN IF NOT EXISTS license_authority TEXT,
  ADD COLUMN IF NOT EXISTS has_international_accreditation BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accreditation_body TEXT;

-- Дополнительное образование
ALTER TABLE school_details
  ADD COLUMN IF NOT EXISTS extracurricular_activities TEXT[], -- Кружки и секции
  ADD COLUMN IF NOT EXISTS clubs TEXT[], -- Клубы
  ADD COLUMN IF NOT EXISTS sports_sections TEXT[]; -- Спортивные секции

-- Индексы для новых полей
CREATE INDEX IF NOT EXISTS idx_school_details_total_teachers ON school_details(total_teachers);
CREATE INDEX IF NOT EXISTS idx_school_details_classrooms_count ON school_details(classrooms_count);
CREATE INDEX IF NOT EXISTS idx_school_details_license_number ON school_details(license_number);

-- Индексы для массивов (GIN)
CREATE INDEX IF NOT EXISTS idx_school_details_extracurricular ON school_details USING GIN(extracurricular_activities);
CREATE INDEX IF NOT EXISTS idx_school_details_clubs ON school_details USING GIN(clubs);
CREATE INDEX IF NOT EXISTS idx_school_details_sports ON school_details USING GIN(sports_sections);

-- Комментарии
COMMENT ON COLUMN school_details.school_start_time IS 'Время начала занятий (например 08:30)';
COMMENT ON COLUMN school_details.school_end_time IS 'Время окончания занятий (например 15:00)';
COMMENT ON COLUMN school_details.extended_day_until IS 'Время окончания продленки (например 18:00)';
COMMENT ON COLUMN school_details.school_area_sqm IS 'Общая площадь школы в квадратных метрах';

