'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth/middleware';

interface AdminSidebarProps {
  user: AuthUser;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
  },
  {
    name: 'Maktablar',
    href: '/admin/schools',
    icon: '🏫',
  },
  {
    name: 'Foydalanuvchilar',
    href: '/admin/users',
    icon: '👥',
  },
  {
    name: 'Sharhlar',
    href: '/admin/reviews',
    icon: '💬',
  },
  {
    name: 'Analitika',
    href: '/admin/analytics',
    icon: '📈',
  },
  {
    name: 'Sozlamalar',
    href: '/admin/settings',
    icon: '⚙️',
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/40 flex flex-col">
      {/* Logo */}
      <div className="h-16 border-b flex items-center px-6">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">EduMap.uz</span>
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.full_name || user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role === 'super_admin' ? 'Super Admin' : 
               user.role === 'admin' ? 'Admin' : 'Moderator'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

