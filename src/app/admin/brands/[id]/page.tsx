import { createClient } from '@/lib/supabase/server';
import { BrandForm } from '@/components/admin/brands/BrandForm';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const supabase = await createClient();

  const { data: brand, error } = await supabase
    .from('school_brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !brand) {
    notFound();
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Brendni tahrirlash</h1>
            <p className="text-muted-foreground mt-1">
              {brand.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/brands">Orqaga</Link>
          </Button>
        </div>
        <BrandForm brand={brand} />
      </div>
    </div>
  );
}

