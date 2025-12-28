import { unstable_cache } from 'next/cache';
import { createClient } from './server';
import type { OrganizationRow } from '@/types/organization';
import {
  getSchoolDetails,
  matchesFilters,
  type SchoolWithDetails as SchoolWithDetailsType
} from '@/lib/utils/school-helpers';

type Organization = OrganizationRow;

// Тип для school_details
type SchoolDetails = {
  id: string;
  organization_id: string;
  school_type: string;
  grade_from: number;
  grade_to: number;
  primary_language: string;
  accepts_preparatory: boolean;
  accepted_grades: number[] | null;
  additional_languages: string[] | null;
  curriculum: string[] | null;
  fee_monthly_min: number | null;
  fee_monthly_max: number | null;
  pricing_tiers: unknown | null;
  [key: string]: unknown;
};

type SchoolWithDetails = Organization & {
  school_details: SchoolDetails | SchoolDetails[] | null;
};

/**
 * Получить все активные школы (оптимизировано - только нужные поля для списка)
 */
export async function getActiveSchools() {
  const supabase = await createClient();
  
  // Для списка школ не нужны все поля - оптимизируем запрос
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      name_uz,
      name_ru,
      slug,
      description,
      short_description,
      status,
      overall_rating,
      reviews_count,
      is_verified,
      city,
      district,
      region_id,
      district_id,
      address,
      phone,
      email,
      website,
      logo_url,
      cover_image_url,
      banner_url,
      is_verified,
      org_type,
      school_details (
        id,
        school_type,
        grade_from,
        grade_to,
        accepts_preparatory,
        primary_language,
        additional_languages,
        fee_monthly_min,
        fee_monthly_max,
        curriculum
      )
    `)
    .eq('org_type', 'school')
    .in('status', ['active', 'published']) // Поддержка старых и новых статусов
    .order('overall_rating', { ascending: false, nullsFirst: false })
    .limit(100); // Ограничиваем для производительности

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Проверка, является ли строка UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Получить школу по slug или UUID
 */
export async function getSchoolBySlug(slugOrId: string): Promise<SchoolWithDetails> {
  const supabase = await createClient();
  
  // Определяем, является ли параметр UUID
  const isId = isUUID(slugOrId);
  
  let query = supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `);
  
  if (isId) {
    // Если это UUID, ищем по id
    query = query.eq('id', slugOrId);
  } else {
    // Если это slug, ищем по slug
    query = query.eq('slug', slugOrId);
  }
  
  // Для публичных страниц показываем только активные или опубликованные школы
  query = query.in('status', ['active', 'published']);
  
  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  return data as SchoolWithDetails;
}


/**
 * Получить филиалы школы
 */
export async function getSchoolBranches(parentId: string): Promise<SchoolWithDetails[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('parent_organization_id', parentId)
    .in('status', ['active', 'published'])
    .order('name');

  if (error) {
    throw error;
  }

  return (data || []) as SchoolWithDetails[];
}

/**
 * Получить школу по ID
 */
export async function getSchoolById(id: string): Promise<SchoolWithDetails> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as SchoolWithDetails;
}

/**
 * Получить главную школу и её филиалы
 */
export async function getSchoolWithBranches(slug: string) {
  const school = await getSchoolBySlug(slug);
  
  // Если это филиал, получаем главную школу
  if (school.parent_organization_id) {
    const mainSchool = await getSchoolById(school.parent_organization_id);
    const branches = await getSchoolBranches(school.parent_organization_id);
    return {
      main: mainSchool,
      current: school,
      branches: branches.filter(b => b.id !== school.id),
    };
  }
  
  // Если это главная школа, получаем филиалы
  const branches = await getSchoolBranches(school.id);

  return {
    main: school,
    current: school,
    branches,
  };
}

/**
 * Получить школы с фильтрами
 */
export type SortOption = 
  | 'rating_desc'
  | 'rating_asc'
  | 'price_asc'
  | 'price_desc'
  | 'reviews_desc'
  | 'popularity';

export async function getSchoolsWithFilters(filters: {
  districts?: string[]; // Массив ID районов (теперь это district_id из таблицы districts)
  region?: number | null; // ID области для фильтрации
  city?: string;
  school_type?: string;
  price_min?: number;
  price_max?: number;
  curriculum?: string[];
  language?: string[];
  grade?: string;
  rating_min?: number;
  has_transport?: boolean;
  has_meals?: boolean;
  has_extended_day?: boolean;
  sort?: SortOption;
}) {
  const supabase = await createClient();
  
  // Оптимизация: выбираем только нужные поля для списка
  let query = supabase
    .from('organizations')
    .select(`
      id,
      name,
      name_uz,
      name_ru,
      slug,
      description,
      short_description,
      status,
      overall_rating,
      reviews_count,
      is_verified,
      city,
      district,
      region_id,
      district_id,
      address,
      phone,
      email,
      website,
      logo_url,
      cover_image_url,
      banner_url,
      is_verified,
      org_type,
      school_details (
        id,
        school_type,
        grade_from,
        grade_to,
        accepts_preparatory,
        primary_language,
        additional_languages,
        fee_monthly_min,
        fee_monthly_max,
        curriculum,
        has_transport,
        has_meals,
        has_extended_day
      )
    `)
    .eq('org_type', 'school')
    .in('status', ['active', 'published']) // Поддержка старых и новых статусов
    .limit(100); // Ограничиваем для производительности

  // Фильтр по области (region_id)
  if (filters.region !== null && filters.region !== undefined) {
    // Преобразуем в число, если нужно
    const regionId = typeof filters.region === 'string' ? parseInt(filters.region, 10) : filters.region;
    if (!isNaN(regionId)) {
      query = query.eq('region_id', regionId);
    }
  }

  // Districts (multi-select) - фильтруем по district_id
  if (filters.districts && filters.districts.length > 0) {
    // Преобразуем строковые ID в числа
    const districtIds = filters.districts.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (districtIds.length > 0) {
      query = query.in('district_id', districtIds);
    }
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  // Rating min - фильтр по overall_rating
  if (filters.rating_min !== undefined) {
    // overall_rating хранится как 0-100, преобразуем в нужный формат
    // Если rating_min = 3, значит нужен рейтинг >= 60 (3 из 5 = 60%)
    const minRatingValue = (filters.rating_min / 5) * 100;
    query = query.gte('overall_rating', minRatingValue);
  }

  // Сортировка по умолчанию (по рейтингу, высокий →)
  const sortOption = filters.sort || 'rating_desc';
  switch (sortOption) {
    case 'rating_desc':
      query = query.order('overall_rating', { ascending: false, nullsFirst: false });
      break;
    case 'rating_asc':
      query = query.order('overall_rating', { ascending: true, nullsFirst: true });
      break;
    case 'reviews_desc':
      query = query.order('reviews_count', { ascending: false, nullsFirst: false });
      break;
    default:
      // Для price и popularity сортируем на клиенте
      query = query.order('overall_rating', { ascending: false, nullsFirst: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  // Фильтрация на клиенте для сложных фильтров
  // Используем централизованную функцию matchesFilters
  const filteredData = data.filter((school) =>
    matchesFilters(school as SchoolWithDetailsType, {
      school_type: filters.school_type,
      price_min: filters.price_min,
      price_max: filters.price_max,
      language: filters.language,
      curriculum: filters.curriculum,
      grade: filters.grade,
      has_transport: filters.has_transport,
      has_meals: filters.has_meals,
      has_extended_day: filters.has_extended_day,
    })
  );

  // Применяем сортировку на клиенте для price и popularity
  if (filters.sort === 'price_asc' || filters.sort === 'price_desc') {
    filteredData.sort((a, b) => {
      const aDetails = getSchoolDetails(a as SchoolWithDetailsType);
      const bDetails = getSchoolDetails(b as SchoolWithDetailsType);

      const aPrice = aDetails?.fee_monthly_min || aDetails?.fee_monthly_max || 0;
      const bPrice = bDetails?.fee_monthly_min || bDetails?.fee_monthly_max || 0;

      return filters.sort === 'price_asc' ? aPrice - bPrice : bPrice - aPrice;
    });
  } else if (filters.sort === 'popularity') {
    filteredData.sort((a, b) => {
      const typedA = a as SchoolWithDetails;
      const typedB = b as SchoolWithDetails;
      const aScore = (typedA.overall_rating || 0) * 0.7 + (typedA.reviews_count || 0) * 0.3;
      const bScore = (typedB.overall_rating || 0) * 0.7 + (typedB.reviews_count || 0) * 0.3;
      return bScore - aScore;
    });
  }

  return filteredData;
}

/**
 * Получить все уникальные районы
 * Оптимизировано: кэширование на 1 час, так как данные редко меняются
 * Использует анонимный клиент, так как не требует авторизации
 */
export async function getDistricts() {
  return unstable_cache(
    async () => {
      // Используем анонимный клиент вместо createClient(), чтобы избежать cookies() внутри cache
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Используем RPC или прямой SQL для получения DISTINCT значений
      // Supabase PostgREST не поддерживает DISTINCT напрямую, но мы можем использовать более эффективный запрос
      const { data, error } = await supabase
        .from('organizations')
        .select('district')
        .eq('org_type', 'school')
        .in('status', ['active', 'published']) // Поддержка старых и новых статусов
        .not('district', 'is', null);

      if (error) {
        throw error;
      }

      if (!data) {
        return [];
      }

      // Фильтруем и получаем уникальные значения
      const uniqueDistricts = Array.from(
        new Set(data.map((org: { district: string | null }) => org.district).filter(Boolean))
      ) as string[];

      return uniqueDistricts.sort();
    },
    ['districts'],
    {
      revalidate: 3600, // Кэш на 1 час
      tags: ['districts'],
    }
  )();
}

/**
 * Получить все уникальные города
 * Оптимизировано: кэширование на 1 час, так как данные редко меняются
 * Использует анонимный клиент, так как не требует авторизации
 */
export async function getCities() {
  return unstable_cache(
    async () => {
      // Используем анонимный клиент вместо createClient(), чтобы избежать cookies() внутри cache
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data, error } = await supabase
        .from('organizations')
        .select('city')
        .eq('org_type', 'school')
        .in('status', ['active', 'published']) // Поддержка старых и новых статусов
        .not('city', 'is', null);

      if (error) {
        throw error;
      }

      if (!data) {
        return [];
      }

      const uniqueCities = Array.from(
        new Set(data.map((org: { city: string | null }) => org.city).filter(Boolean))
      ) as string[];

      return uniqueCities.sort();
    },
    ['cities'],
    {
      revalidate: 3600, // Кэш на 1 час
      tags: ['cities'],
    }
  )();
}

/**
 * Получить районы с количеством школ в каждом (обновлено для нормализованной структуры)
 */
export async function getDistrictsWithCounts(regionId?: number | null) {
  // Не используем unstable_cache для API endpoint, так как он может кэшировать ошибки
  const supabase = await createClient();
  
  // Если выбрана область, получаем районы этой области
  // Иначе получаем все районы
  // Таблица districts еще не в типах Supabase (нужно сгенерировать типы через npx supabase gen types)
  let districtsQuery = (supabase as any)
    .from('districts')
    .select(`
      id,
      name_uz,
      name_ru,
      name_oz,
      region_id,
      district_type
    `);

  if (regionId !== null && regionId !== undefined) {
    districtsQuery = districtsQuery.eq('region_id', regionId);
  }

  const { data: districts, error: districtsError } = await districtsQuery;

  if (districtsError) {
    console.error('Error fetching districts:', districtsError);
    throw districtsError;
  }

  if (!districts || districts.length === 0) {
    return [];
  }

  // Получаем количество школ для каждого района
  const districtIds = districts.map((d: any) => d.id);
  
  // Если districtIds пуст, пропускаем подсчет
  const countMap = new Map<number, number>();
  if (districtIds.length > 0) {
    const { data: schoolsCount, error: countError } = await supabase
      .from('organizations')
      .select('district_id')
      .eq('org_type', 'school')
      .in('status', ['active', 'published']) // Поддержка старых и новых статусов
      .in('district_id', districtIds);

    if (countError) {
      // Если ошибка при подсчете, просто продолжаем без count
      console.warn('Error counting schools for districts:', countError);
    } else {
      // Подсчитываем количество школ для каждого района
      (schoolsCount || []).forEach((school: any) => {
        if (school.district_id) {
          countMap.set(school.district_id, (countMap.get(school.district_id) || 0) + 1);
        }
      });
    }
  }

  // Формируем результат
  // ВАЖНО: Показываем ВСЕ районы, даже без школ (district_id может быть не заполнен)
  return districts
    .map((district: any) => ({
      id: district.id.toString(),
      name: district.name_uz, // Используем name_uz как основное название
      name_uz: district.name_uz,
      name_ru: district.name_ru,
      count: countMap.get(district.id) || 0,
    }))
    // Сортируем: сначала районы со школами, потом остальные, затем по имени
    .sort((a: any, b: any) => {
      if (a.count > 0 && b.count === 0) return -1;
      if (a.count === 0 && b.count > 0) return 1;
      if (a.count !== b.count) return b.count - a.count; // Сортировка по количеству школ
      return a.name_uz.localeCompare(b.name_uz); // Сортировка по имени
    });
}

/**
 * Получить медиа школы (фотографии и видео)
 */
export async function getSchoolMedia(schoolId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('school_media')
    .select('*')
    .eq('organization_id', schoolId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

/**
 * Получить отзывы школы с фильтрацией и сортировкой
 */
export async function getSchoolReviews(
  schoolId: string,
  options?: {
    filter?: number | null;
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    page?: number;
    limit?: number;
  }
) {
  const supabase = await createClient();
  
  const {
    filter = null,
    sort = 'newest',
    page = 1,
    limit = 10,
  } = options || {};
  
  let query = supabase
    .from('school_reviews')
    .select('*', { count: 'exact' })
    .eq('organization_id', schoolId);
  
  if (filter !== null && filter >= 1 && filter <= 5) {
    query = query.eq('rating', filter);
  }
  
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }
  
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw error;
  }
  
  return {
    reviews: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Получить педагогический состав школы
 */
export async function getSchoolStaff(schoolId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('school_staff')
    .select('*')
    .eq('organization_id', schoolId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
}

/**
 * Получить похожие школы
 */
export async function getSimilarSchools(schoolId: string, limit: number = 3) {
  const supabase = await createClient();
  
  // Получаем текущую школу для определения критериев похожести
  const { data: currentSchool } = await supabase
    .from('organizations')
    .select('district, school_details(school_type, curriculum, fee_monthly_min)')
    .eq('id', schoolId)
    .single();
  
  if (!currentSchool) {
    return [];
  }

  // Явно указываем тип для результата запроса
  const typedCurrentSchool = currentSchool as Pick<Organization, 'district' | 'id'> & {
    school_details: Array<{
      school_type: string;
      curriculum: string[] | null;
      fee_monthly_min: number | null;
    }> | null;
  };
  
  let query = supabase
    .from('organizations')
    .select(`
      id,
      name,
      slug,
      cover_image_url,
      overall_rating,
      reviews_count,
      district,
      school_details(
        fee_monthly_min,
        school_type,
        curriculum
      )
    `)
    .eq('org_type', 'school')
    .in('status', ['active', 'published'])
    .neq('id', schoolId);
  
  // Фильтруем по району, если есть
  if (typedCurrentSchool.district) {
    query = query.eq('district', typedCurrentSchool.district);
  }
  
  // Сортируем по рейтингу
  query = query.order('overall_rating', { ascending: false, nullsFirst: false });
  
  // Ограничиваем количество
  query = query.limit(limit);
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data || [];
}