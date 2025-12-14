import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth/middleware';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { unstable_noStore as noStore } from 'next/cache';
import AdminLoading from './loading';

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
    <div className="flex min-h-screen bg-[#F4F4F6]">
      <AdminSidebar user={user} />
      <main className="flex-1 flex flex-col overflow-auto mt-3 mr-3 mb-3 ml-0 rounded-xl bg-[#e4e4e8] shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <AdminHeader user={user} />
        <div className="flex-1 bg-[#F9F9F9]">
          <Suspense fallback={<AdminLoading />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

