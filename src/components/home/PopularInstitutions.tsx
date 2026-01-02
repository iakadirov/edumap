import { createClient } from '@/lib/supabase/server';
import { RecentInstitutionsClient } from './PopularInstitutionsClient';
import type { RecentInstitution } from './PopularInstitutionsClient';

async function getRecentInstitutions(): Promise<RecentInstitution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      name_uz,
      slug,
      org_type,
      overall_rating,
      reviews_count,
      district,
      city,
      logo_url,
      cover_image_url,
      banner_url,
      created_at,
      school_details (
        fee_monthly_min,
        fee_monthly_max
      )
    `)
    .in('status', ['active', 'published'])
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching recent institutions:', error);
    return [];
  }

  return (data || []) as RecentInstitution[];
}

export async function PopularInstitutions() {
  const institutions = await getRecentInstitutions();

  return <RecentInstitutionsClient institutions={institutions} />;
}
