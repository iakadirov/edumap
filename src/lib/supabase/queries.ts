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
export async function getSchoolsWithFilters(filters: {
  districts?: string[]; // Массив ID районов
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

  // Districts (multi-select) - фильтруем по массиву
  if (filters.districts && filters.districts.length > 0) {
    // Преобразуем ID обратно в названия районов
    // Для упрощения используем .in() - но нужно сопоставить ID с реальными названиями
    // TODO: улучшить сопоставление ID -> название района
    query = query.in('district', filters.districts);
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

  const { data, error } = await query.order('overall_rating', {
    ascending: false,
    nullsFirst: false,
  });

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
 * Получить районы с количеством школ в каждом
 */
export async function getDistrictsWithCounts() {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('organizations')
        .select('district')
        .eq('org_type', 'school')
        .eq('status', 'active')
        .not('district', 'is', null);

      if (error) {
        throw error;
      }

      // Группируем и считаем
      const districtCounts = (data || []).reduce((acc, org) => {
        const district = org.district;
        if (district) {
          acc[district] = (acc[district] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Преобразуем в массив с id, name, count
      // Используем само название района как ID для упрощения сопоставления
      const districts = Object.entries(districtCounts).map(([name, count]) => ({
        id: name, // Используем название как ID для простоты
        name: name,
        name_uz: name, // TODO: использовать переводы из translations.ts
        count: count,
      }));

      return districts.sort((a, b) => b.count - a.count); // Сортируем по количеству
    },
    ['districts-with-counts'],
    {
      revalidate: 3600, // Кэш на 1 час
      tags: ['districts'],
    }
  )();
}
