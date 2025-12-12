import { createClient } from '@/lib/supabase/server';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}) {
  noStore(); // Отключаем кэширование для админ-панели
  const supabase = await createClient();
  const params = await searchParams;
  
  const page = parseInt(params.page || '1');
  const pageSize = 10;
  const offset = (page - 1) * pageSize;
  const search = params.search || '';
  const role = params.role || 'all';

  // Построение запроса (оптимизировано)
  let query = supabase
    .from('users')
    .select('id, email, full_name, role, subscription_tier, is_active, created_at', { count: 'exact' });

  // Фильтр по поиску
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  // Фильтр по роли
  if (role !== 'all') {
    query = query.eq('role', role);
  }

  // Получаем данные с пагинацией
  const { data: users, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('Error fetching users:', error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Foydalanuvchilar</h1>
            <p className="text-muted-foreground mt-1">
              Barcha foydalanuvchilarni boshqarish va tahrirlash
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new">Yangi foydalanuvchi qo'shish</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami foydalanuvchilar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium a'zolar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter((u) => u.subscription_tier === 'premium').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adminlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter((u) => ['super_admin', 'admin', 'moderator'].includes(u.role)).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faol foydalanuvchilar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter((u) => u.is_active).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Foydalanuvchilar ro'yxati</CardTitle>
            <CardDescription>
              {count || 0} ta foydalanuvchi topildi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={users || []}
              currentPage={page}
              totalPages={totalPages}
              search={search}
              role={role}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

