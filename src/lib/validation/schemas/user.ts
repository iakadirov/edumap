/**
 * Схемы валидации для пользователей
 */

import { z } from 'zod';
import { emailSchema, uuidSchema } from './common';

/**
 * Роли пользователей
 */
export const userRoleSchema = z.enum([
  'super_admin',
  'admin',
  'moderator',
  'school_admin',
  'user',
]);

/**
 * Уровни подписки
 */
export const subscriptionTierSchema = z.enum([
  'free',
  'premium',
]);

/**
 * Схема создания пользователя
 */
export const createUserSchema = z.object({
  email: z.string().email('Email manzili noto\'g\'ri').max(255),
  full_name: z.string().min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak').max(255).nullable().optional(),
  role: userRoleSchema.optional().default('user'),
  organization_id: uuidSchema.nullable().optional(),
  avatar_url: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional().default(true),
  subscription_tier: subscriptionTierSchema.optional().default('free'),
  subscription_expires_at: z.string().datetime().nullable().optional(),
});

/**
 * Схема обновления пользователя
 */
export const updateUserSchema = createUserSchema.partial().omit({
  email: true, // Email нельзя менять
});

/**
 * Схема входа
 */
export const loginSchema = z.object({
  email: z.string().email('Email manzili noto\'g\'ri'),
  password: z.string().min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'),
});

/**
 * Схема регистрации
 */
export const registerSchema = z.object({
  email: z.string().email('Email manzili noto\'g\'ri'),
  password: z
    .string()
    .min(8, 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Parol kichik va katta harf, hamda raqam bo\'lishi kerak'
    ),
  full_name: z.string().min(2).max(255).optional(),
});

/**
 * Типы
 */
export type UserRole = z.infer<typeof userRoleSchema>;
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Функция валидации
 */
export function validateUser(
  data: unknown,
  isUpdate = false
): { success: true; data: CreateUserInput | UpdateUserInput } | { success: false; errors: string[] } {
  const schema = isUpdate ? updateUserSchema : createUserSchema;
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}
