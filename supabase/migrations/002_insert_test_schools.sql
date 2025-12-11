-- Миграция: Добавление 5 тестовых школ
-- Дата: 2025-12-12

-- Школа 1: Частная школа "Интеллект"
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
  overall_rating
) VALUES (
  'school',
  'Частная школа "Интеллект"',
  'intellect-school',
  'Частная школа с углубленным изучением математики и информатики. Обучение на русском и узбекском языках.',
  '+998901234567',
  'info@intellect.uz',
  'https://intellect.uz',
  'улица Амира Темура, 123',
  'Мирабадский',
  'Ташкент',
  41.3111,
  69.2797,
  'active',
  true,
  85.5
) ON CONFLICT (slug) DO NOTHING;

-- Школа 2: Международная школа "Westminster"
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
  overall_rating
) VALUES (
  'school',
  'Westminster International School',
  'westminster-tashkent',
  'Международная школа с британской программой обучения. Обучение на английском языке.',
  '+998901234568',
  'info@westminster.uz',
  'https://westminster.uz',
  'проспект Бунёдкор, 45',
  'Юнусабадский',
  'Ташкент',
  41.3500,
  69.2800,
  'active',
  true,
  92.3
) ON CONFLICT (slug) DO NOTHING;

-- Школа 3: Школа "Прогресс"
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
  overall_rating
) VALUES (
  'school',
  'Школа "Прогресс"',
  'progress-school',
  'Частная школа с акцентом на развитии творческих способностей и спорта.',
  '+998901234569',
  'info@progress.uz',
  'https://progress.uz',
  'улица Навруз, 78',
  'Шайхантахурский',
  'Ташкент',
  41.3200,
  69.2400,
  'active',
  true,
  78.9
) ON CONFLICT (slug) DO NOTHING;

-- Школа 4: Международная школа "TIS"
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
  overall_rating
) VALUES (
  'school',
  'Tashkent International School',
  'tis-tashkent',
  'Международная школа с программой IB (International Baccalaureate).',
  '+998901234570',
  'info@tis.uz',
  'https://tis.uz',
  'улица Абдуллы Кадыри, 12',
  'Чиланзарский',
  'Ташкент',
  41.3000,
  69.2200,
  'active',
  true,
  88.7
) ON CONFLICT (slug) DO NOTHING;

-- Школа 5: Школа "Звёздочка"
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
  overall_rating
) VALUES (
  'school',
  'Частная школа "Звёздочка"',
  'zvezdochka-school',
  'Частная школа для детей младших классов с продленным днем.',
  '+998901234571',
  'info@zvezdochka.uz',
  'https://zvezdochka.uz',
  'улица Фараби, 56',
  'Учтепинский',
  'Ташкент',
  41.3400,
  69.2600,
  'active',
  true,
  81.2
) ON CONFLICT (slug) DO NOTHING;

-- Добавление деталей для школ

-- Детали для "Интеллект"
INSERT INTO school_details (
  organization_id,
  school_type,
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
  (SELECT id FROM organizations WHERE slug = 'intellect-school'),
  'private',
  1,
  11,
  450,
  25,
  'russian',
  ARRAY['uzbek', 'english'],
  ARRAY['national'],
  2500000,
  3500000,
  true,
  true,
  true
) ON CONFLICT (organization_id) DO NOTHING;

-- Детали для "Westminster"
INSERT INTO school_details (
  organization_id,
  school_type,
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
  (SELECT id FROM organizations WHERE slug = 'westminster-tashkent'),
  'international',
  1,
  11,
  600,
  20,
  'english',
  ARRAY['russian', 'uzbek'],
  ARRAY['cambridge'],
  8000000,
  12000000,
  true,
  true,
  false
) ON CONFLICT (organization_id) DO NOTHING;

-- Детали для "Прогресс"
INSERT INTO school_details (
  organization_id,
  school_type,
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
  (SELECT id FROM organizations WHERE slug = 'progress-school'),
  'private',
  1,
  11,
  320,
  22,
  'uzbek',
  ARRAY['russian', 'english'],
  ARRAY['national'],
  1800000,
  2800000,
  false,
  true,
  true
) ON CONFLICT (organization_id) DO NOTHING;

-- Детали для "TIS"
INSERT INTO school_details (
  organization_id,
  school_type,
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
  (SELECT id FROM organizations WHERE slug = 'tis-tashkent'),
  'international',
  1,
  12,
  550,
  18,
  'english',
  ARRAY['russian', 'uzbek'],
  ARRAY['ib'],
  7500000,
  11000000,
  true,
  true,
  false
) ON CONFLICT (organization_id) DO NOTHING;

-- Детали для "Звёздочка"
INSERT INTO school_details (
  organization_id,
  school_type,
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
  (SELECT id FROM organizations WHERE slug = 'zvezdochka-school'),
  'private',
  1,
  4,
  180,
  20,
  'uzbek',
  ARRAY['russian'],
  ARRAY['national'],
  1500000,
  2200000,
  true,
  true,
  true
) ON CONFLICT (organization_id) DO NOTHING;

