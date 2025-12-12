/**
 * Система разрешений для ролей пользователей
 */

import type { UserRole } from './roles';

export const PERMISSIONS = {
  // Управление школами
  SCHOOLS_CREATE: ['super_admin', 'admin'] as UserRole[],
  SCHOOLS_UPDATE: ['super_admin', 'admin', 'school_admin'] as UserRole[],
  SCHOOLS_DELETE: ['super_admin', 'admin'] as UserRole[],
  SCHOOLS_VIEW_ALL: ['super_admin', 'admin', 'moderator'] as UserRole[],
  SCHOOLS_VIEW_PREMIUM_DATA: ['super_admin', 'admin', 'moderator', 'school_admin', 'user'] as UserRole[], // Но только premium пользователи
  
  // Управление пользователями
  USERS_CREATE: ['super_admin', 'admin'] as UserRole[],
  USERS_UPDATE: ['super_admin', 'admin'] as UserRole[],
  USERS_DELETE: ['super_admin'] as UserRole[],
  USERS_VIEW_ALL: ['super_admin', 'admin'] as UserRole[],
  
  // Модерация
  REVIEWS_MODERATE: ['super_admin', 'admin', 'moderator'] as UserRole[],
  REVIEWS_CREATE: ['super_admin', 'admin', 'moderator', 'school_admin', 'user'] as UserRole[], // Но только авторизованные
  CONTENT_MODERATE: ['super_admin', 'admin', 'moderator'] as UserRole[],
  
  // Аналитика
  ANALYTICS_VIEW: ['super_admin', 'admin'] as UserRole[],
  
  // Настройки
  SETTINGS_UPDATE: ['super_admin'] as UserRole[],
  
  // Доступ к премиум данным
  PREMIUM_DATA_ACCESS: ['super_admin', 'admin', 'moderator', 'school_admin', 'user'] as UserRole[], // Но проверяется subscription_tier
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Проверка разрешения для роли
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(userRole);
}

/**
 * Проверка доступа к премиум данным
 * Требует не только роль, но и premium подписку
 */
export function hasPremiumAccess(
  userRole: UserRole,
  subscriptionTier: 'free' | 'premium',
  subscriptionExpiresAt: Date | null
): boolean {
  // Админы всегда имеют доступ
  if (['super_admin', 'admin', 'moderator'].includes(userRole)) {
    return true;
  }
  
  // Проверка premium подписки
  if (subscriptionTier === 'premium') {
    // Проверка срока действия подписки
    if (subscriptionExpiresAt) {
      return new Date() < subscriptionExpiresAt;
    }
    // Если нет даты окончания, считаем что подписка активна
    return true;
  }
  
  return false;
}

/**
 * Проверка, может ли пользователь оставлять отзывы
 * Требует авторизации (любая роль, кроме неавторизованного)
 */
export function canCreateReview(userRole: UserRole | null): boolean {
  return userRole !== null; // Любой авторизованный пользователь
}

