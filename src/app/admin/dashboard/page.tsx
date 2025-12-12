import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { unstable_noStore as noStore } from 'next/cache';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  noStore(); // Отключаем кэширование для админ-панели
  const supabase = await createClient();

  // Получаем статистику
  const [
    { count: totalSchools },
    { count: activeSchools },
    { count: totalUsers },
    { count: premiumUsers },
    { data: recentUsers },
    { data: recentSchools },
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'premium'),
    supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('organizations')
      .select('id, name_uz, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      title: 'Jami maktablar',
      value: totalSchools || 0,
      description: 'Barcha maktablar',
      change: '+12.5% oyiga',
    },
    {
      title: 'Faol maktablar',
      value: activeSchools || 0,
      description: 'Aktiv holatda',
      change: '+8.2% oyiga',
    },
    {
      title: 'Foydalanuvchilar',
      value: totalUsers || 0,
      description: 'Roʻyxatdan oʻtgan',
      change: '+24.1% oyiga',
    },
    {
      title: 'Premium aʼzolar',
      value: premiumUsers || 0,
      description: 'Pullik tarif',
      change: '+180.1% oyiga',
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Platforma statistikasi va boshqaruv paneli
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Users */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Yangi foydalanuvchilar</CardTitle>
              <CardDescription>Oxirgi roʻyxatdan oʻtganlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.role === 'super_admin' ? 'Super Admin' :
                         user.role === 'admin' ? 'Admin' :
                         user.role === 'moderator' ? 'Moderator' : 'User'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Hozircha foydalanuvchilar yoʻq</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Schools */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Yangi maktablar</CardTitle>
              <CardDescription>Oxirgi qoʻshilgan maktablar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSchools && recentSchools.length > 0 ? (
                  recentSchools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{school.name_uz}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(school.created_at).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                      <Badge
                        variant={school.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {school.status === 'active' ? 'Faol' : 'Kutilmoqda'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Hozircha maktablar yoʻq</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Tezkor amallar</CardTitle>
              <CardDescription>Koʻp ishlatiladigan funksiyalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/admin/schools">Yangi maktab qoʻshish</a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/admin/users">Foydalanuvchi yaratish</a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/admin/analytics">Analitikani koʻrish</a>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <a href="/admin/settings">Sozlamalar</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Oxirgi faollik</CardTitle>
            <CardDescription>Platformadagi soʻnggi amallar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Yangi maktab</span> qoʻshildi
                  </p>
                  <p className="text-xs text-muted-foreground">2 soat oldin</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">3 ta foydalanuvchi</span> roʻyxatdan oʻtdi
                  </p>
                  <p className="text-xs text-muted-foreground">5 soat oldin</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Maktab maʼlumotlari</span> yangilandi
                  </p>
                  <p className="text-xs text-muted-foreground">1 kun oldin</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

