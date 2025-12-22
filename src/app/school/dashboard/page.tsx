import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import type { OrganizationRow } from '@/types/organization';

// Страница всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default async function SchoolDashboardPage() {
  noStore();
  const user = await getCurrentUser();
  if (!user || user.role !== 'school_admin') {
    return null;
  }

  const supabase = await createClient();

  // Получаем школы пользователя
  const { data: schools, error } = await supabase
    .from('organizations')
    .select('id, name, name_uz, name_ru, status, created_at, city, district')
    .or(`admin_user_id.eq.${user.id},id.eq.${user.organization_id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching schools:', error);
  }

  // Явно указываем тип для результата запроса
  const typedSchools = (schools || []) as Pick<OrganizationRow, 'id' | 'name' | 'name_uz' | 'name_ru' | 'status' | 'created_at' | 'city' | 'district'>[];

  const schoolCount = typedSchools.length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mening maktablarim</h1>
            <p className="text-muted-foreground mt-1">
              Maktabingizni boshqarish va tahrirlash
            </p>
          </div>
          <Button asChild>
            <Link href="/school/schools/new">Yangi maktab qo'shish</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami maktablar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schoolCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Schools List */}
        {typedSchools.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {typedSchools.map((school) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{school.name_uz || school.name_ru || school.name}</CardTitle>
                  <CardDescription>
                    {school.city} {school.district ? `, ${school.district}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        school.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : school.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : school.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {school.status === 'published'
                        ? 'Опубликована'
                        : school.status === 'pending'
                        ? 'На модерации'
                        : school.status === 'draft'
                        ? 'Черновик'
                        : school.status}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/school/schools/${school.id}`}>Редактировать</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Sizda hali maktab yo'q</p>
              <Button asChild>
                <Link href="/school/schools/new">Yangi maktab qo'shish</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

