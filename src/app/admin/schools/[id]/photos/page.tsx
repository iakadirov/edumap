import { createClient } from '@/lib/supabase/server';
import { MediaManager } from '@/components/admin/schools/MediaManager';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PhotosPage({
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

  const { data: progress } = await (supabase as any)
    .from('school_sections_progress')
    .select('completeness')
    .eq('organization_id', id)
    .eq('section', 'photos')
    .single();

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🖼 Фотографии</h1>
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

        <MediaManager
          schoolId={id}
          type="photo"
          currentProgress={progress?.completeness || 0}
        />
      </div>
    </div>
  );
}

