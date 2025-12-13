-- Миграция: Обновление тестовых школ с новой структурой регионов и районов
-- Дата: 2025-12-13
-- Описание: Обновляет существующие школы и добавляет новые с region_id и district_id

-- Сначала удаляем старые тестовые школы (можно удалить все или только старые)
-- Оставляем возможность сохранить существующие, поэтому используем UPSERT

-- ============================================================================
-- ШКОЛА 1: Частная школа "Интеллект" (Ташкент, Мирабадский район)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Частная школа "Интеллект"',
    'Xususiy maktab "Intellekt"',
    'Частная школа "Интеллект"',
    'intellect-school',
    'Частная школа с углубленным изучением математики и информатики. Обучение на русском и узбекском языках.',
    'Математика ва информатикани chuqur o''rganish bilan xususiy maktab',
    '+998901234567',
    'info@intellect.uz',
    'https://intellect.uz',
    'улица Амира Темура, 123',
    'Mirobod',
    'Toshkent',
    11, -- город Ташкент
    (SELECT id FROM districts WHERE region_id = 11 AND soato_id = 1726273 LIMIT 1), -- Мирабадский район
    41.3111,
    69.2797,
    'active',
    true,
    85.5,
    23
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id,
    overall_rating = EXCLUDED.overall_rating;

-- Детали для "Интеллект"
INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'intellect-school'),
    'private',
    false,
    1,
    11,
    450,
    25,
    'russian',
    ARRAY['national'],
    2500000,
    3500000,
    true,
    true,
    true
) ON CONFLICT (organization_id) DO UPDATE SET
    school_type = EXCLUDED.school_type,
    grade_from = EXCLUDED.grade_from,
    grade_to = EXCLUDED.grade_to,
    fee_monthly_min = EXCLUDED.fee_monthly_min,
    fee_monthly_max = EXCLUDED.fee_monthly_max;

-- ============================================================================
-- ШКОЛА 2: Международная школа "Westminster" (Ташкент, Юнусабадский район)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Westminster International School',
    'Westminster Xalqaro Maktabi',
    'Westminster International School',
    'westminster-tashkent',
    'Международная школа с британской программой обучения. Обучение на английском языке.',
    'Britaniya o''quv dasturi bilan xalqaro maktab',
    '+998901234568',
    'info@westminster.uz',
    'https://westminster.uz',
    'проспект Бунёдкор, 45',
    'Yunusobod',
    'Toshkent',
    11, -- город Ташкент
    (SELECT id FROM districts WHERE region_id = 11 AND soato_id = 1726266 LIMIT 1), -- Юнусабадский район
    41.3500,
    69.2800,
    'active',
    true,
    92.3,
    45
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id,
    overall_rating = EXCLUDED.overall_rating;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'westminster-tashkent'),
    'international',
    true,
    1,
    11,
    600,
    20,
    'english',
    ARRAY['cambridge'],
    8000000,
    12000000,
    true,
    true,
    false
) ON CONFLICT (organization_id) DO UPDATE SET
    school_type = EXCLUDED.school_type,
    accepts_preparatory = EXCLUDED.accepts_preparatory;

-- ============================================================================
-- ШКОЛА 3: Частная школа "Прогресс" (Ташкент, Шайхантахурский район)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Школа "Прогресс"',
    'Maktab "Progress"',
    'Школа "Прогресс"',
    'progress-school',
    'Частная школа с акцентом на развитии творческих способностей и спорта.',
    'Ijodiy qobiliyat va sportni rivojlantirishga e''tibor qaratgan xususiy maktab',
    '+998901234569',
    'info@progress.uz',
    'https://progress.uz',
    'улица Навруз, 78',
    'Shayxontohur',
    'Toshkent',
    11, -- город Ташкент
    (SELECT id FROM districts WHERE region_id = 11 AND soato_id = 1726277 LIMIT 1), -- Шайхантахурский район
    41.3200,
    69.2400,
    'active',
    true,
    78.9,
    18
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'progress-school'),
    'private',
    false,
    1,
    11,
    320,
    22,
    'uzbek',
    ARRAY['national'],
    1800000,
    2800000,
    false,
    true,
    true
) ON CONFLICT (organization_id) DO UPDATE SET
    has_transport = EXCLUDED.has_transport;

-- ============================================================================
-- ШКОЛА 4: Международная школа TIS (Ташкент, Чиланзарский район)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Tashkent International School',
    'Toshkent Xalqaro Maktabi',
    'Tashkent International School',
    'tis-tashkent',
    'Международная школа с программой IB (International Baccalaureate).',
    'IB dasturi bilan xalqaro maktab',
    '+998901234570',
    'info@tis.uz',
    'https://tis.uz',
    'улица Абдуллы Кадыри, 12',
    'Chilonzor',
    'Toshkent',
    11, -- город Ташкент
    (SELECT id FROM districts WHERE region_id = 11 AND soato_id = 1726294 LIMIT 1), -- Чиланзарский район
    41.3000,
    69.2200,
    'active',
    true,
    88.7,
    32
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'tis-tashkent'),
    'international',
    true,
    1,
    12,
    550,
    18,
    'english',
    ARRAY['ib'],
    7500000,
    11000000,
    true,
    true,
    false
) ON CONFLICT (organization_id) DO UPDATE SET
    grade_to = EXCLUDED.grade_to;

-- ============================================================================
-- ШКОЛА 5: Частная школа "Звёздочка" (Ташкент, Учтепинский район)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Частная школа "Звёздочка"',
    'Xususiy maktab "Yulduzcha"',
    'Частная школа "Звёздочка"',
    'zvezdochka-school',
    'Частная школа для детей младших классов с продленным днем.',
    'Kichik sinflar uchun kengaytirilgan kun bilan xususiy maktab',
    '+998901234571',
    'info@zvezdochka.uz',
    'https://zvezdochka.uz',
    'улица Фараби, 56',
    'Uchtepa',
    'Toshkent',
    11, -- город Ташкент
    (SELECT id FROM districts WHERE region_id = 11 AND soato_id = 1726262 LIMIT 1), -- Учтепинский район
    41.3400,
    69.2600,
    'active',
    true,
    81.2,
    15
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'zvezdochka-school'),
    'private',
    true,
    1,
    4,
    180,
    20,
    'uzbek',
    ARRAY['national'],
    1500000,
    2200000,
    true,
    true,
    true
) ON CONFLICT (organization_id) DO UPDATE SET
    accepts_preparatory = EXCLUDED.accepts_preparatory,
    grade_to = EXCLUDED.grade_to;

-- ============================================================================
-- ШКОЛА 6: Государственная школа (Андижан)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Общеобразовательная школа №15',
    'Umumta''lim maktabi №15',
    'Общеобразовательная школа №15',
    'school-15-andijan',
    'Государственная общеобразовательная школа в городе Андижан.',
    'Andijon shahridagi davlat umumta''lim maktabi',
    '+998742234567',
    'info@school15-andijan.uz',
    NULL,
    'улица Навбахор, 45',
    'Andijon',
    'Andijon',
    2, -- Андижанская область
    (SELECT id FROM districts WHERE region_id = 2 AND soato_id = 1703401 AND district_type = 'shahar' LIMIT 1), -- Город Андижан
    40.7847,
    72.3436,
    'active',
    true,
    72.5,
    12
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'school-15-andijan'),
    'state',
    false,
    1,
    11,
    650,
    30,
    'uzbek',
    ARRAY['national'],
    0,
    0,
    false,
    false,
    false
) ON CONFLICT (organization_id) DO UPDATE SET
    school_type = EXCLUDED.school_type;

-- ============================================================================
-- ШКОЛА 7: Международная школа (Самарканд)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Samarkand International School',
    'Samarqand Xalqaro Maktabi',
    'Samarkand International School',
    'samarkand-international',
    'Международная школа в Самарканде с программой Cambridge.',
    'Cambridge dasturi bilan Samarqanddagi xalqaro maktab',
    '+998662345678',
    'info@samarkand-intl.uz',
    'https://samarkand-intl.uz',
    'улица Регистан, 12',
    'Samarqand',
    'Samarqand',
    8, -- Самаркандская область
    (SELECT id FROM districts WHERE region_id = 8 AND soato_id = 1718401 AND district_type = 'shahar' LIMIT 1), -- Город Самарканд
    39.6542,
    66.9597,
    'active',
    true,
    86.8,
    28
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'samarkand-international'),
    'international',
    true,
    1,
    11,
    420,
    18,
    'english',
    ARRAY['cambridge'],
    6500000,
    9500000,
    true,
    true,
    false
) ON CONFLICT (organization_id) DO UPDATE SET
    curriculum = EXCLUDED.curriculum;

-- ============================================================================
-- ШКОЛА 8: Частная школа (Фергана)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Частная школа "Олтин мактаб"',
    'Xususiy maktab "Oltin maktab"',
    'Частная школа "Олтин мактаб"',
    'oltin-maktab-fergana',
    'Частная школа с углубленным изучением иностранных языков.',
    'Chet tillarni chuqur o''rganish bilan xususiy maktab',
    '+998732345678',
    'info@oltin-maktab.uz',
    'https://oltin-maktab.uz',
    'улица Навруз, 78',
    'Farg''ona',
    'Farg''ona',
    13, -- Ферганская область
    (SELECT id FROM districts WHERE region_id = 13 AND soato_id = 1730401 AND district_type = 'shahar' LIMIT 1), -- Город Фергана
    40.3864,
    71.7864,
    'active',
    true,
    79.3,
    20
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'oltin-maktab-fergana'),
    'private',
    false,
    1,
    11,
    380,
    24,
    'uzbek',
    ARRAY['national'],
    2200000,
    3200000,
    true,
    true,
    true
) ON CONFLICT (organization_id) DO UPDATE SET
    primary_language = EXCLUDED.primary_language;

-- ============================================================================
-- ШКОЛА 9: Частная школа (Бухара)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Частная школа "Бухоро"',
    'Xususiy maktab "Buxoro"',
    'Частная школа "Бухоро"',
    'buxoro-private-school',
    'Частная школа с изучением истории и культуры.',
    'Tarix va madaniyatni o''rganish bilan xususiy maktab',
    '+998652345678',
    'info@buxoro-school.uz',
    'https://buxoro-school.uz',
    'улица Бахауддин Накшбанд, 15',
    'Buxoro',
    'Buxoro',
    3, -- Бухарская область
    (SELECT id FROM districts WHERE region_id = 3 AND soato_id = 1706401 AND district_type = 'shahar' LIMIT 1), -- Город Бухара
    39.7756,
    64.4286,
    'active',
    true,
    76.8,
    14
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'buxoro-private-school'),
    'private',
    false,
    1,
    11,
    290,
    26,
    'uzbek',
    ARRAY['national'],
    2000000,
    3000000,
    false,
    true,
    false
) ON CONFLICT (organization_id) DO UPDATE SET
    has_transport = EXCLUDED.has_transport;

-- ============================================================================
-- ШКОЛА 10: Международная школа IB (Ташкент, Мирзо-Улугбекский район) - для разнообразия
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'International School of Tashkent',
    'Toshkent Xalqaro Maktabi',
    'International School of Tashkent',
    'ist-tashkent',
    'Международная школа с программами IB и Cambridge. Обучение на английском языке.',
    'IB va Cambridge dasturlari bilan xalqaro maktab',
    '+998901234572',
    'info@ist.uz',
    'https://ist.uz',
    'улица Амира Темура, 98',
    'Mirzo Ulug''bek',
    'Toshkent',
    11, -- город Ташкент
    (SELECT id FROM districts WHERE region_id = 11 AND soato_id = 1726269 LIMIT 1), -- Мирзо-Улугбекский район
    41.3150,
    69.2750,
    'active',
    true,
    91.5,
    38
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'ist-tashkent'),
    'international',
    true,
    1,
    12,
    580,
    16,
    'english',
    ARRAY['ib', 'cambridge'], -- Две программы
    9000000,
    13000000,
    true,
    true,
    false
) ON CONFLICT (organization_id) DO UPDATE SET
    curriculum = EXCLUDED.curriculum;

-- ============================================================================
-- ШКОЛА 11: Частная школа (Ташкентская область, Нурафшон)
-- ============================================================================
INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    phone,
    email,
    website,
    address,
    district,
    city,
    region_id,
    district_id,
    lat,
    lng,
    status,
    is_verified,
    overall_rating,
    reviews_count
) VALUES (
    'school',
    'Частная школа "Нурафшон"',
    'Xususiy maktab "Nurafshon"',
    'Частная школа "Нурафшон"',
    'nurafshon-school',
    'Частная школа в городе Нурафшон (Ташкентская область).',
    'Toshkent viloyatidagi Nurafshon shahridagi xususiy maktab',
    '+998701234567',
    'info@nurafshon-school.uz',
    'https://nurafshon-school.uz',
    'улица Университетская, 25',
    'Nurafshon',
    'Nurafshon',
    12, -- Ташкентская область
    (SELECT id FROM districts WHERE region_id = 12 AND soato_id = 1727401 LIMIT 1), -- Город Нурафшон
    41.0265,
    69.3855,
    'active',
    true,
    74.2,
    10
) ON CONFLICT (slug) DO UPDATE SET
    name_uz = EXCLUDED.name_uz,
    name_ru = EXCLUDED.name_ru,
    region_id = EXCLUDED.region_id,
    district_id = EXCLUDED.district_id;

INSERT INTO school_details (
    organization_id,
    school_type,
    accepts_preparatory,
    grade_from,
    grade_to,
    total_students,
    avg_class_size,
    primary_language,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    has_transport,
    has_meals,
    has_extended_day
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'nurafshon-school'),
    'private',
    false,
    1,
    11,
    250,
    28,
    'uzbek',
    ARRAY['national'],
    1800000,
    2600000,
    false,
    false,
    true
) ON CONFLICT (organization_id) DO UPDATE SET
    has_meals = EXCLUDED.has_meals;

-- ============================================================================
-- ПРОВЕРКА: Выводим статистику по созданным школам
-- ============================================================================
DO $$
DECLARE
    total_count INTEGER;
    with_region_id INTEGER;
    with_district_id INTEGER;
    with_both INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM organizations WHERE org_type = 'school' AND status = 'active';
    SELECT COUNT(*) INTO with_region_id FROM organizations WHERE org_type = 'school' AND status = 'active' AND region_id IS NOT NULL;
    SELECT COUNT(*) INTO with_district_id FROM organizations WHERE org_type = 'school' AND status = 'active' AND district_id IS NOT NULL;
    SELECT COUNT(*) INTO with_both FROM organizations WHERE org_type = 'school' AND status = 'active' AND region_id IS NOT NULL AND district_id IS NOT NULL;

    RAISE NOTICE '=== Статистика тестовых школ ===';
    RAISE NOTICE 'Всего активных школ: %', total_count;
    RAISE NOTICE 'С region_id: % (%)', with_region_id, ROUND(with_region_id::NUMERIC / NULLIF(total_count, 0) * 100, 1);
    RAISE NOTICE 'С district_id: % (%)', with_district_id, ROUND(with_district_id::NUMERIC / NULLIF(total_count, 0) * 100, 1);
    RAISE NOTICE 'С обоими: % (%)', with_both, ROUND(with_both::NUMERIC / NULLIF(total_count, 0) * 100, 1);
END $$;

