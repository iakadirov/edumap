import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Получаем статистику
  const [
    { count: totalSchools },
    { count: activeSchools },
    { count: pendingSchools },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    {
      title: 'Jami maktablar',
      value: totalSchools || 0,
      description: 'Barcha maktablar',
    },
    {
      title: 'Faol maktablar',
      value: activeSchools || 0,
      description: 'Aktiv holatda',
    },
    {
      title: 'Kutilayotgan',
      value: pendingSchools || 0,
      description: 'Moderatsiya kutilmoqda',
    },
    {
      title: 'Foydalanuvchilar',
      value: totalUsers || 0,
      description: 'Roʻyxatdan oʻtgan',
    },
  ];

  return (
    <div className="container-wrapper py-8">
      <div className="container-content">
        <div className="container-inner">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Platforma statistikasi va boshqaruv paneli
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Placeholder для графиков и других виджетов */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Oxirgi faollik</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bu yerda oxirgi amallar roʻyxati boʻladi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tezkor amallar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bu yerda tezkor amallar boʻladi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

