-- Миграция: Создание таблиц для управления школами и RLS политики
-- Дата: Декабрь 2025
-- Описание: Создает все необходимые таблицы и RLS политики для системы управления школами

-- ============================================
-- 1. Создание таблицы school_sections_progress
-- ============================================
CREATE TABLE IF NOT EXISTS school_sections_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN (
    'basic', 'education', 'teachers', 'infrastructure', 'services',
    'results', 'admission', 'finance', 'documents', 'photos', 'videos'
  )),
  completeness INTEGER NOT NULL DEFAULT 0 CHECK (completeness >= 0 AND completeness <= 100),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, section)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_school_sections_progress_organization_id ON school_sections_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_sections_progress_section ON school_sections_progress(section);

-- Триггер для автоматического обновления last_updated_at
DROP TRIGGER IF EXISTS update_school_sections_progress_updated_at ON school_sections_progress;
CREATE TRIGGER update_school_sections_progress_updated_at
  BEFORE UPDATE ON school_sections_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Создание таблицы school_media
-- ============================================
CREATE TABLE IF NOT EXISTS school_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  category TEXT,
  caption TEXT,
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_media_organization_id ON school_media(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_media_type ON school_media(type);
CREATE INDEX IF NOT EXISTS idx_school_media_category ON school_media(category);
CREATE INDEX IF NOT EXISTS idx_school_media_is_cover ON school_media(is_cover) WHERE is_cover = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_school_media_cover_unique 
  ON school_media(organization_id) 
  WHERE is_cover = true;

-- ============================================
-- 3. Создание таблицы school_staff
-- ============================================
CREATE TABLE IF NOT EXISTS school_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  experience_years INTEGER,
  education TEXT,
  certifications TEXT[],
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_staff_organization_id ON school_staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_position ON school_staff(position);

DROP TRIGGER IF EXISTS update_school_staff_updated_at ON school_staff;
CREATE TRIGGER update_school_staff_updated_at
  BEFORE UPDATE ON school_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Создание таблицы school_results
-- ============================================
CREATE TABLE IF NOT EXISTS school_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  total_graduates INTEGER,
  graduates_to_universities INTEGER,
  graduates_on_grants INTEGER,
  graduates_to_top_uz_universities INTEGER,
  graduates_to_foreign_universities INTEGER,
  top_universities_uz TEXT[],
  foreign_universities TEXT[],
  avg_dtm_score DECIMAL(5,2),
  avg_ielts_score DECIMAL(3,1),
  avg_sat_score INTEGER,
  students_with_ielts_7plus INTEGER,
  students_with_ielts_8plus INTEGER,
  olympiad_medals_international INTEGER DEFAULT 0,
  olympiad_medals_national INTEGER DEFAULT 0,
  olympiad_medals_city INTEGER DEFAULT 0,
  olympiad_subjects TEXT[],
  school_awards JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, year)
);

CREATE INDEX IF NOT EXISTS idx_school_results_organization_id ON school_results(organization_id);
CREATE INDEX IF NOT EXISTS idx_school_results_year ON school_results(year);
CREATE INDEX IF NOT EXISTS idx_school_results_organization_year ON school_results(organization_id, year DESC);

DROP TRIGGER IF EXISTS update_school_results_updated_at ON school_results;
CREATE TRIGGER update_school_results_updated_at
  BEFORE UPDATE ON school_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RLS политики для school_sections_progress
-- ============================================
ALTER TABLE school_sections_progress ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если есть
DROP POLICY IF EXISTS "Admins and school_admin can view progress" ON school_sections_progress;
DROP POLICY IF EXISTS "Admins and school_admin can insert progress" ON school_sections_progress;
DROP POLICY IF EXISTS "Admins and school_admin can update progress" ON school_sections_progress;
DROP POLICY IF EXISTS "Admins can delete progress" ON school_sections_progress;

-- SELECT: Админы и school_admin могут видеть прогресс
CREATE POLICY "Admins and school_admin can view progress"
  ON school_sections_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_sections_progress.organization_id
      )
    )
  );

-- INSERT: Админы и school_admin могут создавать записи прогресса
CREATE POLICY "Admins and school_admin can insert progress"
  ON school_sections_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_sections_progress.organization_id
      )
    )
  );

-- UPDATE: Админы и school_admin могут обновлять прогресс
CREATE POLICY "Admins and school_admin can update progress"
  ON school_sections_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_sections_progress.organization_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_sections_progress.organization_id
      )
    )
  );

-- DELETE: Только super_admin и admin могут удалять
CREATE POLICY "Admins can delete progress"
  ON school_sections_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );

-- ============================================
-- 6. RLS политики для school_media
-- ============================================
ALTER TABLE school_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and school_admin can view media" ON school_media;
DROP POLICY IF EXISTS "Admins and school_admin can insert media" ON school_media;
DROP POLICY IF EXISTS "Admins and school_admin can update media" ON school_media;
DROP POLICY IF EXISTS "Admins can delete media" ON school_media;

CREATE POLICY "Admins and school_admin can view media"
  ON school_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_media.organization_id
      )
    )
  );

CREATE POLICY "Admins and school_admin can insert media"
  ON school_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_media.organization_id
      )
    )
  );

CREATE POLICY "Admins and school_admin can update media"
  ON school_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_media.organization_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_media.organization_id
      )
    )
  );

CREATE POLICY "Admins can delete media"
  ON school_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );

-- ============================================
-- 7. RLS политики для school_staff
-- ============================================
ALTER TABLE school_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and school_admin can view staff" ON school_staff;
DROP POLICY IF EXISTS "Admins and school_admin can insert staff" ON school_staff;
DROP POLICY IF EXISTS "Admins and school_admin can update staff" ON school_staff;
DROP POLICY IF EXISTS "Admins can delete staff" ON school_staff;

CREATE POLICY "Admins and school_admin can view staff"
  ON school_staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_staff.organization_id
      )
    )
  );

CREATE POLICY "Admins and school_admin can insert staff"
  ON school_staff FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_staff.organization_id
      )
    )
  );

CREATE POLICY "Admins and school_admin can update staff"
  ON school_staff FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_staff.organization_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_staff.organization_id
      )
    )
  );

CREATE POLICY "Admins can delete staff"
  ON school_staff FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );

-- ============================================
-- 8. RLS политики для school_results
-- ============================================
ALTER TABLE school_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and school_admin can view results" ON school_results;
DROP POLICY IF EXISTS "Admins and school_admin can insert results" ON school_results;
DROP POLICY IF EXISTS "Admins and school_admin can update results" ON school_results;
DROP POLICY IF EXISTS "Admins can delete results" ON school_results;

CREATE POLICY "Admins and school_admin can view results"
  ON school_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_results.organization_id
      )
    )
  );

CREATE POLICY "Admins and school_admin can insert results"
  ON school_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_results.organization_id
      )
    )
  );

CREATE POLICY "Admins and school_admin can update results"
  ON school_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_results.organization_id
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator', 'school_admin')
      AND users.is_active = true
      AND (
        users.role != 'school_admin' 
        OR users.organization_id = school_results.organization_id
      )
    )
  );

CREATE POLICY "Admins can delete results"
  ON school_results FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );


