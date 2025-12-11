# Инструкция по настройке Supabase

## Шаг 1: Создать проект в Supabase

### 1.1 Перейдите на Supabase
1. Откройте https://supabase.com
2. Войдите или создайте аккаунт
3. Нажмите **New Project**

### 1.2 Настройте проект
- **Organization**: Выберите или создайте организацию
- **Name**: `EduMap` (или `edumap`)
- **Database Password**: Сохраните пароль! Он понадобится для подключений
- **Region**: Выберите ближайший к Узбекистану регион
  - Рекомендуется: `Southeast Asia (Singapore)` или `East Asia (Tokyo)`
- **Pricing Plan**: Free tier (достаточно для начала)

### 1.3 Дождитесь создания проекта
Создание проекта занимает 1-2 минуты.

### 1.4 Получите ключи доступа
После создания проекта:

1. Перейдите в **Settings** → **API**
2. Найдите раздел **Project API keys**
3. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon/public** key (начинается с `eyJ...`)

### 1.5 Добавьте ключи в проект

Создайте файл `.env.local` в корне проекта (если еще не создан):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Linear (если используете)
LINEAR_API_KEY=lin_api_xxxxx
```

⚠️ **Важно:** 
- Файл `.env.local` уже в `.gitignore` и не попадет в Git
- НЕ коммитьте реальные ключи в репозиторий
- Для Vercel добавьте переменные через Dashboard

---

## Шаг 2: Создать таблицы

### 2.1 Откройте SQL Editor

В Supabase Dashboard:
1. Перейдите в **SQL Editor**
2. Нажмите **New Query**

### 2.2 Создайте таблицу organizations

Выполните следующий SQL:

```sql
-- Создание таблицы organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_type TEXT NOT NULL CHECK (org_type IN ('school', 'university', 'kindergarten', 'center', 'course')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  district TEXT,
  city TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  overall_rating DECIMAL(5, 2) CHECK (overall_rating >= 0 AND overall_rating <= 100),
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_organizations_org_type ON organizations(org_type);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_city ON organizations(city);
CREATE INDEX idx_organizations_district ON organizations(district);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_rating ON organizations(overall_rating DESC);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Создайте таблицу school_details

```sql
-- Создание таблицы school_details
CREATE TABLE school_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  school_type TEXT NOT NULL CHECK (school_type IN ('private', 'state', 'international')),
  grade_from INTEGER NOT NULL CHECK (grade_from >= 1 AND grade_from <= 12),
  grade_to INTEGER NOT NULL CHECK (grade_to >= 1 AND grade_to <= 12 AND grade_to >= grade_from),
  total_students INTEGER CHECK (total_students > 0),
  avg_class_size INTEGER CHECK (avg_class_size > 0),
  primary_language TEXT NOT NULL DEFAULT 'uzbek',
  additional_languages TEXT[],
  curriculum TEXT[] CHECK (
    curriculum <@ ARRAY['national', 'cambridge', 'ib']::TEXT[]
  ),
  fee_monthly_min DECIMAL(10, 2) CHECK (fee_monthly_min >= 0),
  fee_monthly_max DECIMAL(10, 2) CHECK (fee_monthly_max >= 0 AND fee_monthly_max >= fee_monthly_min),
  has_transport BOOLEAN NOT NULL DEFAULT false,
  has_meals BOOLEAN NOT NULL DEFAULT false,
  has_extended_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Индексы
CREATE INDEX idx_school_details_organization_id ON school_details(organization_id);
CREATE INDEX idx_school_details_school_type ON school_details(school_type);
CREATE INDEX idx_school_details_curriculum ON school_details USING GIN(curriculum);
CREATE INDEX idx_school_details_fee_range ON school_details(fee_monthly_min, fee_monthly_max);

-- Триггер для обновления updated_at
CREATE TRIGGER update_school_details_updated_at
  BEFORE UPDATE ON school_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.4 Настроить Row Level Security (RLS)

```sql
-- Включаем RLS для organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_details ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать активные организации
CREATE POLICY "Anyone can view active organizations"
  ON organizations
  FOR SELECT
  USING (status = 'active');

-- Политика: все могут читать детали активных школ
CREATE POLICY "Anyone can view active school details"
  ON school_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = school_details.organization_id
      AND organizations.status = 'active'
    )
  );

-- В будущем можно добавить политики для создания/обновления
-- (только для авторизованных пользователей)
```

---

## Шаг 3: Проверка

### 3.1 Проверьте таблицы

В Supabase Dashboard:
1. Перейдите в **Table Editor**
2. Убедитесь, что видны таблицы:
   - `organizations`
   - `school_details`

### 3.2 Проверьте подключение

В вашем проекте запустите:

```bash
npm run dev
```

Откройте консоль браузера - не должно быть ошибок подключения к Supabase.

---

## Шаг 4: Добавить тестовые данные (опционально)

После настройки можно добавить 5 тестовых школ через SQL Editor или через приложение.

---

## Что дальше?

После настройки Supabase:
1. ✅ Обновите `.env.local` с реальными ключами
2. ✅ Проверьте подключение
3. ✅ Перейдите к следующей задаче: настройка клиента в проекте

---

*Следующий шаг: `src/lib/supabase/client.ts` уже создан, нужно только добавить ключи в `.env.local`*

