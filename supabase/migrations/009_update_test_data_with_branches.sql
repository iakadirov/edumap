-- Миграция: Обновление тестовых данных с примерами филиалов и подготовительного класса
-- Дата: 2025-12-12

-- 1. Добавляем главную школу "Registon maktabi" (если ещё нет)
INSERT INTO organizations (
  org_type,
  name,
  slug,
  description,
  logo_url,
  phone,
  email,
  website,
  address,
  district,
  city,
  lat,
  lng,
  status,
  is_verified,
  overall_rating,
  parent_organization_id
) VALUES (
  'school',
  'Registon maktabi',
  'registon-maktabi',
  'Сеть частных школ с углубленным изучением математики и естественных наук.',
  NULL,
  '+998901234572',
  'info@registon.uz',
  'https://registon.uz',
  'улица Навруз, 15',
  'Яшнабадский',
  'Ташкент',
  41.2850,
  69.2450,
  'active',
  true,
  87.5,
  NULL -- Это главная школа
) ON CONFLICT (slug) DO UPDATE SET
  parent_organization_id = NULL; -- Убеждаемся, что это главная школа

-- Детали для главной школы "Registon maktabi"
INSERT INTO school_details (
  organization_id,
  school_type,
  accepts_preparatory,
  grade_from,
  grade_to,
  total_students,
  avg_class_size,
  primary_language,
  additional_languages,
  curriculum,
  fee_monthly_min,
  fee_monthly_max,
  has_transport,
  has_meals,
  has_extended_day
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'registon-maktabi'),
  'private',
  true, -- Принимает 0 класс
  1,
  11,
  500,
  24,
  'uzbek',
  ARRAY['russian', 'english'],
  ARRAY['national'],
  3000000,
  4000000,
  true,
  true,
  true
) ON CONFLICT (organization_id) DO UPDATE SET
  accepts_preparatory = true;

-- 2. Добавляем филиал "Registon maktabi Andijon filiali"
INSERT INTO organizations (
  org_type,
  name,
  slug,
  description,
  phone,
  email,
  website,
  address,
  district,
  city,
  lat,
  lng,
  status,
  is_verified,
  overall_rating,
  parent_organization_id
) VALUES (
  'school',
  'Registon maktabi Andijon filiali',
  'registon-maktabi-andijon',
  'Филиал сети Registon maktabi в городе Андижан.',
  '+998742345678',
  'andijon@registon.uz',
  'https://registon.uz/andijon',
  'улица Бунёдкор, 45',
  'Центральный',
  'Андижан',
  40.7847,
  72.3436,
  'active',
  true,
  85.0,
  (SELECT id FROM organizations WHERE slug = 'registon-maktabi')
) ON CONFLICT (slug) DO UPDATE SET
  parent_organization_id = (SELECT id FROM organizations WHERE slug = 'registon-maktabi');

-- Детали для филиала в Андижане
INSERT INTO school_details (
  organization_id,
  school_type,
  accepts_preparatory,
  grade_from,
  grade_to,
  total_students,
  avg_class_size,
  primary_language,
  additional_languages,
  curriculum,
  fee_monthly_min,
  fee_monthly_max,
  has_transport,
  has_meals,
  has_extended_day
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'registon-maktabi-andijon'),
  'private',
  true, -- Принимает 0 класс
  1,
  11,
  350,
  25,
  'uzbek',
  ARRAY['russian'],
  ARRAY['national'],
  2800000,
  3700000,
  true,
  true,
  true
) ON CONFLICT (organization_id) DO UPDATE SET
  accepts_preparatory = true;

-- 3. Добавляем филиал "Registon maktabi Namangan filiali"
INSERT INTO organizations (
  org_type,
  name,
  slug,
  description,
  phone,
  email,
  website,
  address,
  district,
  city,
  lat,
  lng,
  status,
  is_verified,
  overall_rating,
  parent_organization_id
) VALUES (
  'school',
  'Registon maktabi Namangan filiali',
  'registon-maktabi-namangan',
  'Филиал сети Registon maktabi в городе Наманган.',
  '+998692345678',
  'namangan@registon.uz',
  'https://registon.uz/namangan',
  'проспект Ислама Каримова, 78',
  'Центральный',
  'Наманган',
  40.9983,
  71.6726,
  'active',
  true,
  83.5,
  (SELECT id FROM organizations WHERE slug = 'registon-maktabi')
) ON CONFLICT (slug) DO UPDATE SET
  parent_organization_id = (SELECT id FROM organizations WHERE slug = 'registon-maktabi');

-- Детали для филиала в Намангане
INSERT INTO school_details (
  organization_id,
  school_type,
  accepts_preparatory,
  grade_from,
  grade_to,
  total_students,
  avg_class_size,
  primary_language,
  additional_languages,
  curriculum,
  fee_monthly_min,
  fee_monthly_max,
  has_transport,
  has_meals,
  has_extended_day
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'registon-maktabi-namangan'),
  'private',
  false, -- Не принимает 0 класс
  1,
  11,
  280,
  23,
  'uzbek',
  ARRAY['russian'],
  ARRAY['national'],
  2700000,
  3600000,
  false,
  true,
  true
) ON CONFLICT (organization_id) DO UPDATE SET
  accepts_preparatory = false;

-- 4. Обновляем существующие школы: добавляем поддержку подготовительного класса где нужно

-- "Звёздочка" - начальная школа с подготовительным классом
UPDATE school_details
SET accepts_preparatory = true
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'zvezdochka-school');

-- "Интеллект" - принимает подготовительный класс
UPDATE school_details
SET accepts_preparatory = true
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'intellect-school');

-- "Прогресс" - не принимает подготовительный класс (оставляем false по умолчанию)
-- "Westminster" и "TIS" - международные школы, обычно не имеют подготовительного класса в нашем формате

