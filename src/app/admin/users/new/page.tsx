import { UserForm } from '@/components/admin/users/UserForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { unstable_noStore as noStore } from 'next/cache';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default function NewUserPage() {
  noStore();
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Yangi foydalanuvchi qo'shish</h1>
            <p className="text-muted-foreground mt-1">
              Yangi foydalanuvchi ma'lumotlarini kiriting
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
              Barcha majburiy maydonlarni to'ldiring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

