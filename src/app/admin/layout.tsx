import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/middleware';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { unstable_noStore as noStore } from 'next/cache';

// Админ-панель всегда динамическая (не кэшируется)
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore(); // Отключаем кэширование для админ-панели
  // Проверка авторизации и роли
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect('/auth/login?redirect=/admin/dashboard');
  }

  if (!user || !['super_admin', 'admin', 'moderator'].includes(user.role)) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

