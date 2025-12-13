-- Миграция: Исправление RLS политики для INSERT в users
-- Дата: 2025-12-26
-- Проблема: "new row violates row-level security policy for table users"
-- Причина: Функция get_user_role может возвращать NULL или политика конфликтует

-- Удаляем существующую политику INSERT, если есть
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Super admins can create users" ON users;

-- Улучшаем функцию get_user_role для более надежной работы
-- Добавляем обработку NULL и проверку is_active
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id UUID)
RETURNS TEXT AS $$
  SELECT role 
  FROM users 
  WHERE auth_user_id = user_auth_id 
    AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Создаем политику INSERT с более надежной проверкой
-- Разрешаем super_admin, admin и moderator создавать пользователей
-- (moderator может создавать school_admin и user, но не других админов)
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    -- Проверяем роль текущего пользователя
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'admin', 'moderator')
    )
    -- super_admin и admin могут создавать любых пользователей (кроме super_admin для admin)
    -- moderator может создавать только school_admin и user
    AND (
      -- super_admin может создавать всех
      EXISTS (
        SELECT 1 FROM users
        WHERE auth_user_id = auth.uid()
          AND is_active = true
          AND role = 'super_admin'
      )
      OR
      -- admin может создавать всех кроме super_admin
      (
        EXISTS (
          SELECT 1 FROM users
          WHERE auth_user_id = auth.uid()
            AND is_active = true
            AND role = 'admin'
        )
        AND (role IS NULL OR role != 'super_admin')
      )
      OR
      -- moderator может создавать только school_admin и user
      (
        EXISTS (
          SELECT 1 FROM users
          WHERE auth_user_id = auth.uid()
            AND is_active = true
            AND role = 'moderator'
        )
        AND role IN ('school_admin', 'user')
      )
    )
  );

