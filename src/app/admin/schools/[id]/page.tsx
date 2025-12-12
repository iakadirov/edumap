import { createClient } from '@/lib/supabase/server';
import { SchoolForm } from '@/components/admin/schools/SchoolForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Получаем школу с деталями
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (orgError || !organization) {
    notFound();
  }

  const { data: schoolDetails, error: detailsError } = await supabase
    .from('school_details')
    .select('*')
    .eq('organization_id', id)
    .single();

  // Если school_details нет, создаем пустой объект
  const details = schoolDetails || null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maktabni tahrirlash</h1>
            <p className="text-muted-foreground mt-1">
              {organization.name_uz || organization.name_ru || organization.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/schools">Orqaga</Link>
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Maktab ma'lumotlari</CardTitle>
            <CardDescription>
              Maktab ma'lumotlarini yangilang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolForm organization={organization} schoolDetails={details} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

