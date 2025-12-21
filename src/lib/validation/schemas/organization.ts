/**
 * Схемы валидации для организаций
 */

import { z } from 'zod';
import {
  phoneSchema,
  emailSchema,
  urlSchema,
  slugSchema,
  uuidSchema,
  latitudeSchema,
  longitudeSchema,
  telegramSchema,
  socialUsernameSchema,
  organizationStatusSchema,
  orgTypeSchema,
  yearSchema,
} from './common';

/**
 * Схема создания организации
 */
export const createOrganizationSchema = z.object({
  // Обязательные поля
  name: z.string().min(2, 'Nom kamida 2 ta belgidan iborat bo\'lishi kerak').max(255),
  org_type: orgTypeSchema,
  slug: slugSchema,

  // Названия на разных языках
  name_uz: z.string().min(2).max(255).nullable().optional(),
  name_ru: z.string().max(255).nullable().optional(),

  // Описание
  description: z.string().max(5000).nullable().optional(),
  detailed_description: z.string().max(5000).nullable().optional(),
  short_description: z.string().max(500).nullable().optional(),
  motto: z.string().max(500).nullable().optional(),

  // Статус
  status: organizationStatusSchema.optional().default('draft'),

  // Контактная информация
  phone: phoneSchema,
  phone_secondary: phoneSchema,
  phone_secondary_comment: z.string().max(100).nullable().optional(),
  phone_admission: phoneSchema,
  phone_admission_comment: z.string().max(100).nullable().optional(),
  email: emailSchema,
  email_admission: emailSchema,
  website: urlSchema,

  // Социальные сети
  telegram: telegramSchema,
  telegram_channel: telegramSchema,
  instagram: socialUsernameSchema,
  facebook: urlSchema,
  youtube: urlSchema,

  // Адрес
  region_id: z.number().int().positive().nullable().optional(),
  district_id: z.number().int().positive().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  region: z.string().max(100).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  landmark: z.string().max(255).nullable().optional(),

  // Координаты
  lat: latitudeSchema,
  lng: longitudeSchema,

  // Карты
  google_maps_url: urlSchema,
  yandex_maps_url: urlSchema,

  // Медиа
  logo_url: z.string().max(500).nullable().optional(),
  cover_image_url: z.string().max(500).nullable().optional(),
  banner_url: z.string().max(500).nullable().optional(),

  // Связи
  brand_id: uuidSchema.nullable().optional(),
  parent_organization_id: uuidSchema.nullable().optional(),
  admin_user_id: uuidSchema.nullable().optional(),

  // Метаданные
  founded_year: yearSchema,
  is_verified: z.boolean().optional().default(false),
});

/**
 * Схема обновления организации (все поля опциональны)
 * Важно: status без default, чтобы не сбрасывать статус при обновлении
 */
export const updateOrganizationSchema = createOrganizationSchema
  .partial()
  .omit({
    org_type: true, // Нельзя менять тип организации
    status: true, // Убираем status с default
  })
  .extend({
    // Добавляем status обратно, но без default
    status: organizationStatusSchema.optional(),
  });

/**
 * Типы
 */
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

/**
 * Функция валидации с детальными ошибками
 */
export function validateOrganization(
  data: unknown,
  isUpdate = false
): { success: true; data: CreateOrganizationInput | UpdateOrganizationInput } | { success: false; errors: string[] } {
  const schema = isUpdate ? updateOrganizationSchema : createOrganizationSchema;
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
