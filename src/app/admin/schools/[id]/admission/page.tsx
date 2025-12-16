import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const supabase = await createClient();

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (orgError || !organization) {
    notFound();
  }

  const { data: progress } = await (supabase as any)
    .from('school_sections_progress')
    .select('completeness')
    .eq('organization_id', id)
    .eq('section', 'admission')
    .maybeSingle();

  const completeness = progress?.completeness || 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/schools/${id}`}
              className="text-muted-foreground hover:text-foreground transition-colors mb-2 inline-block"
            >
              ← Назад к профилю
            </Link>
            <h1 className="text-3xl font-bold">📋 Поступление и приём</h1>
            <p className="text-muted-foreground mt-1">
              {organization.name_uz || organization.name_ru || organization.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/schools/${organization.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Saytda ko'rish
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Заполненность раздела</CardTitle>
              <span className="text-2xl font-bold">{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поступление и приём</CardTitle>
            <CardDescription>
              Требования, документы, процесс
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Раздел в разработке</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

