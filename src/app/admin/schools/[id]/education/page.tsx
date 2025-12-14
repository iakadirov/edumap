import { createClient } from '@/lib/supabase/server';
import { EducationForm } from '@/components/admin/schools/sections/EducationForm';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EducationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (!organization) {
    notFound();
  }

  const { data: schoolDetails } = await supabase
    .from('school_details')
    .select('*')
    .eq('organization_id', id)
    .single();

  const { data: progress } = await supabase
    .from('school_sections_progress')
    .select('completeness')
    .eq('organization_id', id)
    .eq('section', 'education')
    .single();

  // Получаем данные раздела
  const sectionResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/schools/${id}/sections/education`,
    {
      cache: 'no-store',
    }
  );
  const sectionData = sectionResponse.ok ? await sectionResponse.json() : null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📚 Образовательная программа</h1>
            <p className="text-muted-foreground mt-1">
              {organization.name_uz || organization.name_ru || organization.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/admin/schools/${id}`}>← Назад к профилю</Link>
          </Button>
        </div>

        <EducationForm
          schoolId={id}
          schoolDetails={schoolDetails}
          currentProgress={progress?.completeness || 0}
        />
      </div>
    </div>
  );
}
