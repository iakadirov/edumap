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
  district?: string;
  city?: string;
  school_type?: string;
  price_min?: number;
  price_max?: number;
  curriculum?: string[];
  language?: string[]; // Изменено на массив для множественного выбора
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
        curriculum
      )
    `)
    .eq('org_type', 'school')
    .eq('status', 'active')
    .limit(100); // Ограничиваем для производительности

  if (filters.district) {
    query = query.eq('district', filters.district);
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  if (filters.school_type) {
    query = query.eq('school_details.school_type', filters.school_type);
  }

  if (filters.price_min !== undefined) {
    query = query.gte('school_details.fee_monthly_min', filters.price_min);
  }

  if (filters.price_max !== undefined) {
    query = query.lte('school_details.fee_monthly_max', filters.price_max);
  }

  // Для одного языка используем фильтрацию на уровне БД
  if (filters.language && filters.language.length === 1) {
    query = query.eq('school_details.primary_language', filters.language[0]);
  }

  const { data, error } = await query.order('overall_rating', {
    ascending: false,
    nullsFirst: false,
  });

  if (error) {
    throw error;
  }

  // Для множественного выбора языков фильтруем на клиенте
  // (Supabase не поддерживает .in() для вложенных полей напрямую)
  if (filters.language && filters.language.length > 1 && data) {
    return data.filter((school: any) => {
      const details = Array.isArray(school.school_details)
        ? school.school_details[0]
        : school.school_details;
      return details && filters.language?.includes(details.primary_language);
    });
  }

  return data;
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
