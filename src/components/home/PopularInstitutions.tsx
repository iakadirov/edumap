import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PopularInstitutionsClient } from './PopularInstitutionsClient';
import type { PopularInstitution } from './PopularInstitutionsClient';

type OrganizationType = 'school' | 'kindergarten' | 'university' | 'course';

async function getPopularInstitutions(orgType: OrganizationType): Promise<PopularInstitution[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      name_uz,
      slug,
      overall_rating,
      reviews_count,
      district,
      city,
      logo_url,
      cover_image_url,
      banner_url,
      school_details (
        fee_monthly_min,
        fee_monthly_max
      )
    `)
    .eq('org_type', orgType)
    .in('status', ['active', 'published'])
    .not('overall_rating', 'is', null)
    .order('overall_rating', { ascending: false })
    .order('reviews_count', { ascending: false })
    .limit(3);

  if (error) {
    console.error(`Error fetching ${orgType}:`, error);
    return [];
  }

  return (data || []) as PopularInstitution[];
}

export async function PopularInstitutions() {
  // Получаем популярные учреждения для каждого типа
  const [schools, kindergartens, universities, courses] = await Promise.all([
    getPopularInstitutions('school'),
    getPopularInstitutions('kindergarten'),
    getPopularInstitutions('university'),
    getPopularInstitutions('course'),
  ]);

  return (
    <PopularInstitutionsClient
      institutions={{
        school: schools,
        kindergarten: kindergartens,
        university: universities,
        course: courses,
      }}
    />
  );
}
