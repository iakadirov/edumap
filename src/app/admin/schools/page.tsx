import { createClient } from '@/lib/supabase/server';
import { SchoolsTable } from '@/components/admin/schools/SchoolsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  noStore(); // Отключаем кэширование для админ-панели
  const supabase = await createClient();
  const params = await searchParams;
  
  const page = parseInt(params.page || '1');
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const search = params.search || '';
  const status = params.status || 'all';

  // Построение запроса (оптимизировано - только нужные поля, без city)
  let query = supabase
    .from('organizations')
    .select('id, slug, name, name_uz, name_ru, status, created_at', { count: 'exact' });

  // Фильтр по поиску
  if (search) {
    query = query.or(`name.ilike.%${search}%,name_uz.ilike.%${search}%,name_ru.ilike.%${search}%`);
  }

  // Фильтр по статусу
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Получаем данные с пагинацией
  const { data: schools, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching schools:', error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Получаем прогресс заполненности для всех школ параллельно
  const schoolIds = schools?.map(s => s.id) || [];
  let progressMap = new Map<string, number>();
  
  if (schoolIds.length > 0) {
    try {
      // Получаем средний прогресс для каждой школы
      const { data: progressData } = await (supabase as any)
        .from('school_sections_progress')
        .select('organization_id, completeness')
        .in('organization_id', schoolIds);

      if (progressData) {
        // Группируем по organization_id и вычисляем средний прогресс
        const progressBySchool = progressData.reduce((acc: Record<string, number[]>, item: any) => {
          if (!acc[item.organization_id]) {
            acc[item.organization_id] = [];
          }
          acc[item.organization_id].push(item.completeness || 0);
          return acc;
        }, {});

        // Вычисляем средний прогресс для каждой школы
        Object.entries(progressBySchool).forEach(([schoolId, completions]) => {
          const completionsArray = completions as number[];
          const avgProgress = completionsArray.reduce((sum, val) => sum + val, 0) / completionsArray.length;
          progressMap.set(schoolId, Math.round(avgProgress));
        });
      }
    } catch (progressError) {
      // Игнорируем ошибки прогресса - просто не показываем его
      console.warn('Could not fetch progress data:', progressError);
    }
  }

  // Получаем статистику одним запросом (оптимизировано)
  const { data: allStatuses } = await supabase
    .from('organizations')
    .select('status')
    .eq('org_type', 'school');

  const stats = {
    total: allStatuses?.length || 0,
    published: allStatuses?.filter((s) => s.status === 'published').length || 0,
    pending: allStatuses?.filter((s) => s.status === 'pending').length || 0,
    draft: allStatuses?.filter((s) => s.status === 'draft').length || 0,
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maktablar</h1>
            <p className="text-muted-foreground mt-1">
              Barcha maktablarni boshqarish va tahrirlash
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/schools/new">Yangi maktab qo'shish</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami maktablar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Опубликованные</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">На модерации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Черновики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Maktablar ro'yxati</CardTitle>
            <CardDescription>
              {count || 0} ta maktab topildi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolsTable
              schools={schools || []}
              currentPage={page}
              totalPages={totalPages}
              search={search}
              status={status}
              progressMap={progressMap}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

