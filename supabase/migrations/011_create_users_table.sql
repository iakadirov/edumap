-- Миграция: Создание таблицы users и системы ролей
-- Дата: Декабрь 2025
-- Описание: Таблица для хранения пользователей платформы с ролями и тарифами

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связь с Supabase Auth
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Базовая информация
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Роль пользователя
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'moderator', 'school_admin', 'user')),
  
  -- Тариф пользователя (для платного доступа к данным)
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ, -- Дата окончания подписки (null для free)
  
  -- Связь с организацией (для school_admin)
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Статус
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  
  -- Метаданные
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Обновление таблицы organizations: добавление связи с admin пользователем
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_admin_user_id ON organizations(admin_user_id);

-- Row Level Security (RLS) политики
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политика: Super Admin видит всех пользователей
CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'super_admin'
      AND u.is_active = true
    )
  );

-- Политика: Admin видит всех кроме super_admin
CREATE POLICY "Admins can view non-super-admin users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
      AND u.is_active = true
    )
    AND role != 'super_admin'
  );

-- Политика: Пользователь видит только себя
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  USING (auth_user_id = auth.uid());

-- Политика: Super Admin может обновлять всех
CREATE POLICY "Super admins can update all users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'super_admin'
      AND u.is_active = true
    )
  );

-- Политика: Admin может обновлять не-super-admin пользователей
CREATE POLICY "Admins can update non-super-admin users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
      AND u.is_active = true
    )
    AND role != 'super_admin'
  );

-- Политика: Пользователь может обновлять только себя
-- Ограничения на изменение роли и is_active будут проверяться на уровне приложения
CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Политика: Super Admin может создавать пользователей
CREATE POLICY "Super admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role = 'super_admin'
      AND u.is_active = true
    )
  );

-- Комментарии к таблице и колонкам
COMMENT ON TABLE users IS 'Пользователи платформы EduMap.uz';
COMMENT ON COLUMN users.role IS 'Роль: super_admin, admin, moderator, school_admin, user';
COMMENT ON COLUMN users.subscription_tier IS 'Тариф: free (бесплатный) или premium (платный доступ к данным)';
COMMENT ON COLUMN users.organization_id IS 'Связь с организацией для school_admin';
COMMENT ON COLUMN users.auth_user_id IS 'Связь с auth.users из Supabase Auth';

