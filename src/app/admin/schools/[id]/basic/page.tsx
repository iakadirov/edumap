import { createClient } from '@/lib/supabase/server';
import { BasicInfoForm } from '@/components/admin/schools/sections/BasicInfoForm';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BasicInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const supabase = await createClient();

  // Получаем данные школы
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (!organization) {
    notFound();
  }

  // Получаем данные школы (может не быть)
  const { data: schoolDetails, error: schoolDetailsError } = await supabase
    .from('school_details')
    .select('*')
    .eq('organization_id', id)
    .maybeSingle();

  if (schoolDetailsError) {
    console.error('Error fetching school details:', schoolDetailsError);
  }

  // Получаем прогресс раздела (может не быть)
  const { data: progress, error: progressError } = await (supabase as any)
    .from('school_sections_progress')
    .select('completeness')
    .eq('organization_id', id)
    .eq('section', 'basic')
    .maybeSingle();
  
  if (progressError) {
    console.error('Error fetching progress:', progressError);
  }
  
  // Логируем загруженный прогресс
  console.log('[BasicInfoPage] Loaded progress from DB:', progress?.completeness || 0);

  // Получаем регионы и районы
  const { data: regions, error: regionsError } = await (supabase as any)
    .from('regions')
    .select('*')
    .order('name_uz');

  if (regionsError) {
    console.error('Error fetching regions:', regionsError);
  }

  const { data: districts, error: districtsError } = await (supabase as any)
    .from('districts')
    .select('*')
    .eq('region_id', (organization as any).region_id || 0)
    .order('name_uz');

  if (districtsError) {
    console.error('Error fetching districts:', districtsError);
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📝 Базовая информация</h1>
            <p className="text-muted-foreground mt-1">
              {organization.name_uz || organization.name_ru || organization.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/admin/schools/${id}`}>← Назад к профилю</Link>
          </Button>
        </div>

        <BasicInfoForm
          organization={organization}
          schoolDetails={schoolDetails}
          regions={regions || []}
          districts={districts || []}
          currentProgress={progress?.completeness || 0}
        />
      </div>
    </div>
  );
}
