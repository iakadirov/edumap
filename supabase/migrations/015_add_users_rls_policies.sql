-- Миграция: Добавление RLS политик для users (INSERT, UPDATE, DELETE)
-- Дата: 2025-12-12
-- Проблема: Админы не могут создавать/обновлять пользователей из-за отсутствия RLS политик

-- INSERT: Только super_admin и admin могут создавать пользователей
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
  );

-- UPDATE: Админы могут обновлять пользователей (с ограничениями)
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
    -- Пользователь не может менять super_admin роль (кроме super_admin)
    AND (
      OLD.role != 'super_admin' 
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.auth_user_id = auth.uid()
        AND users.role = 'super_admin'
        AND users.is_active = true
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
      AND users.is_active = true
    )
    -- Нельзя назначить super_admin роль (кроме super_admin)
    AND (
      NEW.role != 'super_admin'
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.auth_user_id = auth.uid()
        AND users.role = 'super_admin'
        AND users.is_active = true
      )
    )
  );

-- DELETE: Только super_admin и admin могут удалять (уже есть в 011, но проверим)
-- Проверяем, есть ли уже политика DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can delete users'
  ) THEN
    CREATE POLICY "Admins can delete users"
      ON users FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.auth_user_id = auth.uid()
          AND users.role IN ('super_admin', 'admin')
          AND users.is_active = true
        )
        -- Нельзя удалять super_admin (кроме super_admin)
        AND (
          OLD.role != 'super_admin'
          OR EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_user_id = auth.uid()
            AND users.role = 'super_admin'
            AND users.is_active = true
          )
        )
      );
  END IF;
END $$;

