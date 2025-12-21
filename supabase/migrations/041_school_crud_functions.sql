-- Миграция: Функции для атомарных операций со школами
-- Дата: 2025-12-21
-- Описание: RPC функции для создания и обновления школ с транзакциями

-- Функция создания школы с деталями (атомарная операция)
CREATE OR REPLACE FUNCTION create_school_with_details(
  p_organization JSONB,
  p_school_details JSONB
) RETURNS JSONB AS $$
DECLARE
  v_org_id UUID;
  v_result JSONB;
BEGIN
  -- Создаем организацию
  INSERT INTO organizations (
    org_type,
    name,
    name_uz,
    name_ru,
    slug,
    description,
    short_description,
    status,
    phone,
    phone_secondary,
    phone_secondary_comment,
    phone_admission,
    phone_admission_comment,
    email,
    website,
    telegram,
    instagram,
    facebook,
    youtube,
    region_id,
    district_id,
    address,
    landmark,
    lat,
    lng,
    logo_url,
    banner_url,
    cover_image_url,
    brand_id,
    admin_user_id,
    is_verified
  )
  SELECT
    COALESCE(p_organization->>'org_type', 'school'),
    p_organization->>'name',
    p_organization->>'name_uz',
    p_organization->>'name_ru',
    p_organization->>'slug',
    p_organization->>'description',
    p_organization->>'short_description',
    COALESCE(p_organization->>'status', 'published'),
    p_organization->>'phone',
    p_organization->>'phone_secondary',
    p_organization->>'phone_secondary_comment',
    p_organization->>'phone_admission',
    p_organization->>'phone_admission_comment',
    p_organization->>'email',
    p_organization->>'website',
    p_organization->>'telegram',
    p_organization->>'instagram',
    p_organization->>'facebook',
    p_organization->>'youtube',
    (p_organization->>'region_id')::INTEGER,
    (p_organization->>'district_id')::INTEGER,
    p_organization->>'address',
    p_organization->>'landmark',
    (p_organization->>'lat')::NUMERIC,
    (p_organization->>'lng')::NUMERIC,
    p_organization->>'logo_url',
    p_organization->>'banner_url',
    p_organization->>'cover_image_url',
    (p_organization->>'brand_id')::UUID,
    (p_organization->>'admin_user_id')::UUID,
    COALESCE((p_organization->>'is_verified')::BOOLEAN, FALSE)
  RETURNING id INTO v_org_id;

  -- Создаем детали школы
  INSERT INTO school_details (
    organization_id,
    school_type,
    grade_from,
    grade_to,
    accepts_preparatory,
    accepted_grades,
    primary_language,
    additional_languages,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    pricing_tiers
  )
  SELECT
    v_org_id,
    COALESCE(p_school_details->>'school_type', 'private'),
    COALESCE((p_school_details->>'grade_from')::INTEGER, 1),
    COALESCE((p_school_details->>'grade_to')::INTEGER, 11),
    COALESCE((p_school_details->>'accepts_preparatory')::BOOLEAN, FALSE),
    CASE
      WHEN p_school_details->'accepted_grades' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_school_details->'accepted_grades')::INTEGER)
      ELSE NULL
    END,
    COALESCE(p_school_details->>'primary_language', 'uzbek'),
    CASE
      WHEN p_school_details->'additional_languages' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_school_details->'additional_languages'))
      ELSE NULL
    END,
    CASE
      WHEN p_school_details->'curriculum' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_school_details->'curriculum'))
      ELSE NULL
    END,
    (p_school_details->>'fee_monthly_min')::NUMERIC,
    (p_school_details->>'fee_monthly_max')::NUMERIC,
    p_school_details->'pricing_tiers';

  -- Создаем запись прогресса секций
  INSERT INTO school_sections_progress (organization_id)
  VALUES (v_org_id)
  ON CONFLICT (organization_id) DO NOTHING;

  -- Возвращаем результат
  v_result := jsonb_build_object(
    'success', TRUE,
    'id', v_org_id,
    'slug', p_organization->>'slug'
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to create school: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция обновления школы с деталями (атомарная операция)
CREATE OR REPLACE FUNCTION update_school_with_details(
  p_school_id UUID,
  p_organization JSONB,
  p_school_details JSONB
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Проверяем существование школы
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = p_school_id) THEN
    RAISE EXCEPTION 'School not found: %', p_school_id;
  END IF;

  -- Обновляем организацию
  UPDATE organizations SET
    name = COALESCE(p_organization->>'name', name),
    name_uz = COALESCE(p_organization->>'name_uz', name_uz),
    name_ru = COALESCE(p_organization->>'name_ru', name_ru),
    description = COALESCE(p_organization->>'description', description),
    short_description = COALESCE(p_organization->>'short_description', short_description),
    status = COALESCE(p_organization->>'status', status),
    phone = COALESCE(p_organization->>'phone', phone),
    phone_secondary = COALESCE(p_organization->>'phone_secondary', phone_secondary),
    phone_secondary_comment = COALESCE(p_organization->>'phone_secondary_comment', phone_secondary_comment),
    phone_admission = COALESCE(p_organization->>'phone_admission', phone_admission),
    phone_admission_comment = COALESCE(p_organization->>'phone_admission_comment', phone_admission_comment),
    email = COALESCE(p_organization->>'email', email),
    website = COALESCE(p_organization->>'website', website),
    telegram = COALESCE(p_organization->>'telegram', telegram),
    instagram = COALESCE(p_organization->>'instagram', instagram),
    facebook = COALESCE(p_organization->>'facebook', facebook),
    youtube = COALESCE(p_organization->>'youtube', youtube),
    region_id = COALESCE((p_organization->>'region_id')::INTEGER, region_id),
    district_id = COALESCE((p_organization->>'district_id')::INTEGER, district_id),
    address = COALESCE(p_organization->>'address', address),
    landmark = COALESCE(p_organization->>'landmark', landmark),
    lat = COALESCE((p_organization->>'lat')::NUMERIC, lat),
    lng = COALESCE((p_organization->>'lng')::NUMERIC, lng),
    logo_url = COALESCE(p_organization->>'logo_url', logo_url),
    banner_url = COALESCE(p_organization->>'banner_url', banner_url),
    cover_image_url = COALESCE(p_organization->>'cover_image_url', cover_image_url),
    brand_id = CASE
      WHEN p_organization ? 'brand_id' THEN (p_organization->>'brand_id')::UUID
      ELSE brand_id
    END,
    updated_at = NOW()
  WHERE id = p_school_id;

  -- Обновляем или создаем детали школы
  INSERT INTO school_details (
    organization_id,
    school_type,
    grade_from,
    grade_to,
    accepts_preparatory,
    accepted_grades,
    primary_language,
    additional_languages,
    curriculum,
    fee_monthly_min,
    fee_monthly_max,
    pricing_tiers
  )
  VALUES (
    p_school_id,
    COALESCE(p_school_details->>'school_type', 'private'),
    COALESCE((p_school_details->>'grade_from')::INTEGER, 1),
    COALESCE((p_school_details->>'grade_to')::INTEGER, 11),
    COALESCE((p_school_details->>'accepts_preparatory')::BOOLEAN, FALSE),
    CASE
      WHEN p_school_details->'accepted_grades' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_school_details->'accepted_grades')::INTEGER)
      ELSE NULL
    END,
    COALESCE(p_school_details->>'primary_language', 'uzbek'),
    CASE
      WHEN p_school_details->'additional_languages' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_school_details->'additional_languages'))
      ELSE NULL
    END,
    CASE
      WHEN p_school_details->'curriculum' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_school_details->'curriculum'))
      ELSE NULL
    END,
    (p_school_details->>'fee_monthly_min')::NUMERIC,
    (p_school_details->>'fee_monthly_max')::NUMERIC,
    p_school_details->'pricing_tiers'
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    school_type = COALESCE(EXCLUDED.school_type, school_details.school_type),
    grade_from = COALESCE(EXCLUDED.grade_from, school_details.grade_from),
    grade_to = COALESCE(EXCLUDED.grade_to, school_details.grade_to),
    accepts_preparatory = COALESCE(EXCLUDED.accepts_preparatory, school_details.accepts_preparatory),
    accepted_grades = COALESCE(EXCLUDED.accepted_grades, school_details.accepted_grades),
    primary_language = COALESCE(EXCLUDED.primary_language, school_details.primary_language),
    additional_languages = COALESCE(EXCLUDED.additional_languages, school_details.additional_languages),
    curriculum = COALESCE(EXCLUDED.curriculum, school_details.curriculum),
    fee_monthly_min = COALESCE(EXCLUDED.fee_monthly_min, school_details.fee_monthly_min),
    fee_monthly_max = COALESCE(EXCLUDED.fee_monthly_max, school_details.fee_monthly_max),
    pricing_tiers = COALESCE(EXCLUDED.pricing_tiers, school_details.pricing_tiers),
    updated_at = NOW();

  -- Возвращаем результат
  v_result := jsonb_build_object(
    'success', TRUE,
    'id', p_school_id
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to update school: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии
COMMENT ON FUNCTION create_school_with_details IS 'Атомарное создание школы с деталями в одной транзакции';
COMMENT ON FUNCTION update_school_with_details IS 'Атомарное обновление школы с деталями в одной транзакции';
