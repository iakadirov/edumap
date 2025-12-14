-- Миграция: Обновление RLS политики для organizations с поддержкой статуса 'published'
-- Дата: 2025-12-15
-- Описание: Обновляем политику SELECT для публичного доступа к школам со статусом 'active' или 'published'

-- Проверяем, существует ли политика, и обновляем ее
DO $$
BEGIN
  -- Удаляем старую политику, если она существует
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'organizations' 
    AND policyname = 'Admins can view all organizations'
  ) THEN
    DROP POLICY "Admins can view all organizations" ON organizations;
  END IF;
END $$;

-- Создаем новую политику с поддержкой статусов 'active' и 'published'
CREATE POLICY "Admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'moderator')
      AND users.is_active = true
    )
    OR status IN ('active', 'published') -- Публичный доступ к активным и опубликованным
  );

-- Также обновляем политику для school_details
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'school_details' 
    AND policyname = 'Admins can view all school_details'
  ) THEN
    DROP POLICY "Admins can view all school_details" ON school_details;
  END IF;
END $$;

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
        AND organizations.status IN ('active', 'published')
      )
    )
  );

