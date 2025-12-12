/**
 * Константы и типы для системы ролей
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SCHOOL_ADMIN: 'school_admin',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

/**
 * Проверка, является ли роль административной
 */
export function isAdminRole(role: string): boolean {
  return ['super_admin', 'admin', 'moderator'].includes(role);
}

/**
 * Проверка, является ли роль администратора школы
 */
export function isSchoolAdminRole(role: string): boolean {
  return role === 'school_admin';
}

/**
 * Получить название роли на узбекском
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator',
    school_admin: 'Maktab Admin',
    user: 'Foydalanuvchi',
  };
  return labels[role] || role;
}

/**
 * Получить название тарифа на узбекском
 */
export function getSubscriptionTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    free: 'Bepul',
    premium: 'Premium',
  };
  return labels[tier] || tier;
}

