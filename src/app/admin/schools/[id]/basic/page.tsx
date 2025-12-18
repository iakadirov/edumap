import { createClient } from '@/lib/supabase/server';
import { BasicInfoForm } from '@/components/admin/schools/sections/BasicInfoForm';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BasicInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const supabase = await createClient();

  // Параллельно получаем все необходимые данные
  const [
    orgResult,
    schoolDetailsResult,
    progressResult,
    regionsResult,
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('school_details')
      .select('*')
      .eq('organization_id', id)
      .maybeSingle(),
    (async () => {
      try {
        const result = await (supabase as any)
          .from('school_sections_progress')
          .select('completeness')
          .eq('organization_id', id)
          .eq('section', 'basic')
          .maybeSingle();
        return result;
      } catch (error) {
        // Игнорируем ошибки прогресса
        return { data: null, error: null };
      }
    })(),
    (supabase as any)
      .from('regions')
      .select('*')
      .order('name_uz'),
  ]);

  const { data: organization } = orgResult;
  const { data: schoolDetails } = schoolDetailsResult;
  const { data: progress } = progressResult;
  const { data: regions } = regionsResult;

  if (!organization) {
    notFound();
  }

  // Получаем районы для выбранного региона
  const { data: districts } = await (supabase as any)
    .from('districts')
    .select('*')
    .eq('region_id', (organization as any).region_id || 0)
    .order('name_uz');

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
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/schools/${organization.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Saytda ko'rish
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/schools/${id}`}>← Назад к профилю</Link>
            </Button>
          </div>
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
