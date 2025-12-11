import { createClient } from './server';
import type { Database } from '@/types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];
type SchoolDetails = Database['public']['Tables']['school_details']['Row'];

/**
 * Получить все активные школы
 */
export async function getActiveSchools() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('org_type', 'school')
    .eq('status', 'active')
    .order('overall_rating', { ascending: false, nullsLast: true });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Получить школу по slug
 */
export async function getSchoolBySlug(slug: string) {
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

  return data;
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
  language?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('org_type', 'school')
    .eq('status', 'active');

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

  if (filters.language) {
    query = query.eq('school_details.primary_language', filters.language);
  }

  const { data, error } = await query.order('overall_rating', {
    ascending: false,
    nullsLast: true,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Получить все уникальные районы
 */
export async function getDistricts() {
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

  const uniqueDistricts = Array.from(
    new Set(data.map((org) => org.district).filter(Boolean))
  ) as string[];

  return uniqueDistricts.sort();
}

/**
 * Получить все уникальные города
 */
export async function getCities() {
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

  const uniqueCities = Array.from(
    new Set(data.map((org) => org.city).filter(Boolean))
  ) as string[];

  return uniqueCities.sort();
}

