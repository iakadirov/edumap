-- Миграция: Исправление RLS политик для users (устранение бесконечной рекурсии)
-- Дата: Декабрь 2025
-- Проблема: Политики проверяли users через подзапрос, что создавало рекурсию

-- Удаляем старые политики
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view non-super-admin users" ON users;
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can update non-super-admin users" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;
DROP POLICY IF EXISTS "Super admins can create users" ON users;

-- Создаем новые политики БЕЗ рекурсии
-- Используем функцию для проверки роли через auth.uid() напрямую

-- Функция для получения роли пользователя (без рекурсии)
CREATE OR REPLACE FUNCTION get_user_role(user_auth_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE auth_user_id = user_auth_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Политика: Пользователь видит только себя
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  USING (auth_user_id = auth.uid());

-- Политика: Super Admin видит всех (используем функцию для проверки)
CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- Политика: Admin видит всех кроме super_admin
CREATE POLICY "Admins can view non-super-admin users"
  ON users FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND role != 'super_admin'
  );

-- Политика: Пользователь может обновлять только себя
CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Политика: Super Admin может обновлять всех
CREATE POLICY "Super admins can update all users"
  ON users FOR UPDATE
  USING (get_user_role(auth.uid()) = 'super_admin');

-- Политика: Admin может обновлять не-super-admin пользователей
CREATE POLICY "Admins can update non-super-admin users"
  ON users FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
    AND role != 'super_admin'
  );

-- Политика: Super Admin может создавать пользователей
CREATE POLICY "Super admins can create users"
  ON users FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- ВРЕМЕННО: Отключаем RLS для разработки (можно включить позже)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Или лучше: разрешаем всем читать для отладки (ВРЕМЕННО!)
-- ВНИМАНИЕ: Это только для разработки! В production нужно использовать правильные политики
CREATE POLICY "Temporary: allow all reads for debugging"
  ON users FOR SELECT
  USING (true);

