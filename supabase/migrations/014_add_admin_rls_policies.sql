-- Миграция: Добавление RLS политик для админов (INSERT, UPDATE, DELETE)
-- Дата: 2025-12-12
-- Проблема: Админы не могут создавать/обновлять школы из-за отсутствия RLS политик

-- Политики для organizations

-- INSERT: Админы могут создавать организации
CREATE POLICY "Admins can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
  );

-- UPDATE: Админы могут обновлять организации
CREATE POLICY "Admins can update organizations"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
  );

-- DELETE: Только super_admin и admin могут удалять
CREATE POLICY "Admins can delete organizations"
  ON organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );

-- Удаляем старую политику SELECT, если существует
DROP POLICY IF EXISTS "Anyone can view active organizations" ON organizations;

-- SELECT: Админы могут видеть все организации, остальные - только активные
CREATE POLICY "Admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
    OR status = 'active' -- Публичный доступ к активным
  );

-- Политики для school_details

-- INSERT: Админы могут создавать school_details
CREATE POLICY "Admins can insert school_details"
  ON school_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
  );

-- UPDATE: Админы могут обновлять school_details
CREATE POLICY "Admins can update school_details"
  ON school_details FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
  );

-- DELETE: Только super_admin и admin могут удалять
CREATE POLICY "Admins can delete school_details"
  ON school_details FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );

-- Удаляем старую политику SELECT, если существует
DROP POLICY IF EXISTS "Anyone can view active school details" ON school_details;

-- SELECT: Админы могут видеть все school_details, остальные - только для активных школ
CREATE POLICY "Admins can view all school_details"
  ON school_details FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
    OR (
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = school_details.organization_id
        AND organizations.status = 'active'
      )
    )
  );

