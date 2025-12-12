-- Миграция: Добавление RLS политик для users (INSERT, UPDATE, DELETE)
-- Дата: 2025-12-12
-- Проблема: Админы не могут создавать/обновлять пользователей из-за отсутствия RLS политик

-- Используем функцию get_user_role для избежания рекурсии
-- Функция уже создана в миграции 013_fix_users_rls_policies.sql

-- Удаляем старую политику INSERT, если существует
DROP POLICY IF EXISTS "Super admins can create users" ON users;

-- INSERT: Только super_admin и admin могут создавать пользователей
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) IN ('super_admin', 'admin')
  );

-- UPDATE: Админы могут обновлять пользователей (с ограничениями)
-- Обновляем существующую политику для admin
DROP POLICY IF EXISTS "Admins can update non-super-admin users" ON users;

CREATE POLICY "Admins can update non-super-admin users"
  ON users FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND role != 'super_admin'
  )
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND role != 'super_admin'
  );

-- DELETE: Только super_admin и admin могут удалять
DROP POLICY IF EXISTS "Admins can delete users" ON users;

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (
    get_user_role(auth.uid()) IN ('super_admin', 'admin')
    -- Нельзя удалять super_admin (кроме super_admin)
    AND (
      role != 'super_admin'
      OR get_user_role(auth.uid()) = 'super_admin'
    )
  );

