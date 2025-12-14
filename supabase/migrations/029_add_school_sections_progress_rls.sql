-- Миграция: Добавление RLS политик для school_sections_progress
-- Дата: Декабрь 2025
-- Описание: Политики доступа для таблицы прогресса разделов

-- Проверяем, включен ли RLS, и включаем если нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'school_sections_progress' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE school_sections_progress ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

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

