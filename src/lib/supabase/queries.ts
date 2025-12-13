import { createClient } from './server';
import { unstable_cache } from 'next/cache';
import type { Database } from '@/types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];
type SchoolDetails = Database['public']['Tables']['school_details']['Row'];

// Тип для школы с деталями (результат SELECT с JOIN)
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
      city,
      district,
      region_id,
      district_id,
      address,
      phone,
      email,
      website,
      logo_url,
      org_type,
      school_details (
        id,
        school_type,
        grade_from,
        grade_to,
        accepts_preparatory,
        primary_language,
        fee_monthly_min,
        fee_monthly_max,
        curriculum
      )
    `)
    .eq('org_type', 'school')
    .eq('status', 'active')
    .order('overall_rating', { ascending: false, nullsFirst: false })
    .limit(100); // Ограничиваем для производительности

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Получить школу по slug
 */
export async function getSchoolBySlug(slug: string): Promise<SchoolWithDetails> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

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
    .eq('status', 'active')
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
    .eq('status', 'active')
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
      city,
      district,
      region_id,
      district_id,
      address,
      phone,
      email,
      website,
      logo_url,
      org_type,
      school_details (
        id,
        school_type,
        grade_from,
        grade_to,
        accepts_preparatory,
        primary_language,
        fee_monthly_min,
        fee_monthly_max,
        curriculum,
        has_transport,
        has_meals,
        has_extended_day
      )
    `)
    .eq('org_type', 'school')
    .eq('status', 'active')
    .limit(100); // Ограничиваем для производительности

  // Фильтр по области (region_id)
  if (filters.region !== null && filters.region !== undefined) {
    query = query.eq('region_id', filters.region);
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
  let filteredData = data;

  // School type
  if (filters.school_type) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && details.school_type === filters.school_type;
    });
  }

  // Price range
  if (filters.price_min !== undefined || filters.price_max !== undefined) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      if (!details) return false;
      
      const min = details.fee_monthly_min;
      const max = details.fee_monthly_max;
      
      if (filters.price_min !== undefined && max !== null && max < filters.price_min) {
        return false;
      }
      if (filters.price_max !== undefined && min !== null && min > filters.price_max) {
        return false;
      }
      return true;
    });
  }

  // Grade - проверяем, что школа принимает в этот класс
  if (filters.grade && filters.grade !== 'any' && filters.grade !== 'preschool') {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      if (!details) return false;
      
      const gradeNum = Number(filters.grade);
      if (isNaN(gradeNum)) return true; // Если не число, пропускаем
      
      // Проверяем диапазон классов
      return (
        (details.grade_from !== null && gradeNum >= details.grade_from) &&
        (details.grade_to !== null && gradeNum <= details.grade_to)
      );
    });
  } else if (filters.grade === 'preschool') {
    // Проверяем подготовительный класс (0 класс)
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && details.accepts_preparatory === true;
    });
  }

  // Language - множественный выбор
  if (filters.language && filters.language.length > 0) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && filters.language?.includes(details.primary_language);
    });
  }

  // Curriculum - множественный выбор
  if (filters.curriculum && filters.curriculum.length > 0) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      if (!details || !details.curriculum) return false;
      const schoolCurricula = Array.isArray(details.curriculum) ? details.curriculum : [details.curriculum];
      return filters.curriculum?.some((curr) => schoolCurricula.includes(curr));
    });
  }

  // Services
  if (filters.has_transport) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && details.has_transport === true;
    });
  }

  if (filters.has_meals) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && details.has_meals === true;
    });
  }

  if (filters.has_extended_day) {
    filteredData = filteredData.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && details.has_extended_day === true;
    });
  }

  // Применяем сортировку на клиенте для price и popularity
  if (filters.sort === 'price_asc' || filters.sort === 'price_desc') {
    filteredData.sort((a: any, b: any) => {
      const aDetails = Array.isArray(a.school_details) ? a.school_details[0] : a.school_details;
      const bDetails = Array.isArray(b.school_details) ? b.school_details[0] : b.school_details;
      
      const aPrice = aDetails?.fee_monthly_min || aDetails?.fee_monthly_max || 0;
      const bPrice = bDetails?.fee_monthly_min || bDetails?.fee_monthly_max || 0;
      
      if (filters.sort === 'price_asc') {
        return aPrice - bPrice;
      } else {
        return bPrice - aPrice;
      }
    });
  } else if (filters.sort === 'popularity') {
    // Сортировка по популярности: комбинация рейтинга и количества отзывов
    filteredData.sort((a: any, b: any) => {
      const aScore = (a.overall_rating || 0) * 0.7 + (a.reviews_count || 0) * 0.3;
      const bScore = (b.overall_rating || 0) * 0.7 + (b.reviews_count || 0) * 0.3;
      return bScore - aScore;
    });
  }

  return filteredData;
}

/**
 * Получить все уникальные районы
 * Оптимизировано: кэширование на 1 час, так как данные редко меняются
 */
export async function getDistricts() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      // Используем RPC или прямой SQL для получения DISTINCT значений
      // Supabase PostgREST не поддерживает DISTINCT напрямую, но мы можем использовать более эффективный запрос
      const { data, error } = await supabase
        .from('organizations')
        .select('district')
        .eq('org_type', 'school')
        .eq('status', 'active')
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
 */
export async function getCities() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('organizations')
        .select('city')
        .eq('org_type', 'school')
        .eq('status', 'active')
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
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      // Если выбрана область, получаем районы этой области
      // Иначе получаем все районы
      let districtsQuery = supabase
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
        throw districtsError;
      }

      if (!districts || districts.length === 0) {
        return [];
      }

      // Получаем количество школ для каждого района
      const districtIds = districts.map(d => d.id);
      const { data: schoolsCount, error: countError } = await supabase
        .from('organizations')
        .select('district_id')
        .eq('org_type', 'school')
        .eq('status', 'active')
        .in('district_id', districtIds);

      if (countError) {
        throw countError;
      }

      // Подсчитываем количество школ для каждого района
      const countMap = new Map<number, number>();
      (schoolsCount || []).forEach((school: any) => {
        if (school.district_id) {
          countMap.set(school.district_id, (countMap.get(school.district_id) || 0) + 1);
        }
      });

      // Формируем результат
      return districts
        .map(district => ({
          id: district.id.toString(),
          name: district.name_ru,
          name_uz: district.name_uz,
          name_ru: district.name_ru,
          count: countMap.get(district.id) || 0,
        }))
        .filter(d => d.count > 0 || regionId === null) // Показываем только районы со школами, если область не выбрана
        .sort((a, b) => b.count - a.count); // Сортируем по количеству школ
    },
    [`districts-with-counts-${regionId || 'all'}`],
    {
      revalidate: 3600, // Кэш на 1 час
      tags: ['districts'],
    }
  )();
}
