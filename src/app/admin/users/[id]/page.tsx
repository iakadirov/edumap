import { createClient } from '@/lib/supabase/server';
import { UserForm } from '@/components/admin/users/UserForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const supabase = await createClient();

  // Получаем пользователя
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    notFound();
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Foydalanuvchini tahrirlash</h1>
            <p className="text-muted-foreground mt-1">
              {user.full_name || user.email}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/users">Orqaga</Link>
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Foydalanuvchi ma'lumotlari</CardTitle>
            <CardDescription>
              Foydalanuvchi ma'lumotlarini yangilang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

