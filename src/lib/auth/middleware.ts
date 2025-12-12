/**
 * Middleware и утилиты для проверки авторизации и ролей
 */

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from './roles';
import { hasPermission, hasPremiumAccess } from './permissions';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription_tier: 'free' | 'premium';
  subscription_expires_at: Date | null;
  organization_id: string | null;
  is_active: boolean;
}

/**
 * Получить текущего авторизованного пользователя
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

      // Получаем данные пользователя из таблицы users (оптимизировано - только нужные поля)
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role, subscription_tier, subscription_expires_at, organization_id, is_active')
        .eq('auth_user_id', authUser.id)
        .single();

  if (error || !user) {
    return null;
  }

  // Проверка активности
  if (!user.is_active) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    role: user.role as UserRole,
    subscription_tier: user.subscription_tier as 'free' | 'premium',
    subscription_expires_at: user.subscription_expires_at ? new Date(user.subscription_expires_at) : null,
    organization_id: user.organization_id,
    is_active: user.is_active,
  };
}

/**
 * Проверка, авторизован ли пользователь
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Проверка роли пользователя
 */
export async function requireRole(requiredRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!requiredRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

/**
 * Проверка разрешения
 */
export async function requirePermission(permission: keyof typeof import('./permissions').PERMISSIONS): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!hasPermission(user.role, permission)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

/**
 * Проверка доступа к премиум данным
 */
export async function requirePremiumAccess(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!hasPremiumAccess(user.role, user.subscription_tier, user.subscription_expires_at)) {
    throw new Error('Premium subscription required');
  }
  
  return user;
}

