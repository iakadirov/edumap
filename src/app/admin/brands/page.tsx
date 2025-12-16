import { createClient } from '@/lib/supabase/server';
import { BrandList } from '@/components/admin/brands/BrandList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  noStore();
  const supabase = await createClient();
  const params = await searchParams;
  
  const page = parseInt(params.page || '1');
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const search = params.search || '';

  // Построение запроса
  let query = supabase
    .from('school_brands')
    .select('*, schools_count:organizations!brand_id(count)', { count: 'exact' });

  // Фильтр по поиску
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Получаем данные с пагинацией
  const { data: brands, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching brands:', error);
  }

  // Преобразуем данные для удобства
  const brandsWithCount = brands?.map((brand: any) => ({
    ...brand,
    schools_count: brand.schools_count?.[0]?.count || 0,
  })) || [];

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brendlar</h1>
            <p className="text-muted-foreground mt-1">
              Maktab brendlarini boshqarish
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/brands/new">Yangi brend qo'shish</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami brendlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami maktablar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brandsWithCount.reduce((sum, b) => sum + (b.schools_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Brendlar ro'yxati</CardTitle>
            <CardDescription>
              {count || 0} ta brend topildi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandList
              brands={brandsWithCount}
              currentPage={page}
              totalPages={totalPages}
              search={search}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

