-- Миграция: Создание первого администратора
-- ВНИМАНИЕ: Замените auth_user_id на реальный ID из auth.users
-- 
-- Как получить auth_user_id:
-- 1. Создайте пользователя через Supabase Dashboard → Authentication → Users
-- 2. Скопируйте User UID
-- 3. Замените 'YOUR_AUTH_USER_ID_HERE' на этот UID

-- Пример запроса (раскомментируйте и замените auth_user_id):
/*
INSERT INTO users (
  auth_user_id,
  email,
  full_name,
  role,
  subscription_tier,
  is_active,
  email_verified
)
VALUES (
  '5986332a-43fa-4206-a860-e41973f9eca0', -- Замените на реальный auth_user_id
  'iakadirov@edumap.uz',
  'Ibrahim Kadirov', -- Опционально
  'super_admin',
  'premium',
  true,
  true
)
ON CONFLICT (auth_user_id) DO UPDATE
SET
  role = EXCLUDED.role,
  subscription_tier = EXCLUDED.subscription_tier,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified;
*/

-- Проверка: убедитесь что пользователь существует в auth.users
-- SELECT id, email FROM auth.users WHERE id = '5986332a-43fa-4206-a860-e41973f9eca0';

