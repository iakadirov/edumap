/**
 * Схемы валидации для деталей школы
 */

import { z } from 'zod';
import {
  positiveNumberSchema,
  percentSchema,
  stringArraySchema,
  numberArraySchema,
  schoolTypeSchema,
  languageSchema,
  curriculumSchema,
} from './common';

/**
 * Схема тарифа по классам
 */
export const pricingTierSchema = z.object({
  grades: z.array(z.number().int().min(0).max(11)),
  price: z.number().min(0).nullable(),
});

/**
 * Схема создания деталей школы
 */
export const createSchoolDetailsSchema = z.object({
  // Обязательные поля
  organization_id: z.string().uuid(),
  school_type: schoolTypeSchema,
  grade_from: z.number().int().min(0).max(11).default(1),
  grade_to: z.number().int().min(1).max(11).default(11),

  // Классы
  accepts_preparatory: z.boolean().optional().default(false),
  accepted_grades: z.array(z.number().int().min(0).max(11)).nullable().optional(),

  // Языки
  primary_language: languageSchema.optional().default('uzbek'),
  additional_languages: z.array(languageSchema).nullable().optional(),

  // Учебная программа
  curriculum: z.array(curriculumSchema).nullable().optional(),

  // Стоимость
  fee_monthly_min: positiveNumberSchema,
  fee_monthly_max: positiveNumberSchema,
  entrance_fee: positiveNumberSchema,
  uniform_fee: positiveNumberSchema,
  textbook_fee_yearly: positiveNumberSchema,
  transport_fee_monthly: positiveNumberSchema,
  meal_fee_monthly: positiveNumberSchema,
  pricing_tiers: z.array(pricingTierSchema).nullable().optional(),

  // Услуги
  has_transport: z.boolean().optional().default(false),
  has_meals: z.boolean().optional().default(false),
  has_extended_day: z.boolean().optional().default(false),
  extended_day_until: z.string().max(10).nullable().optional(),
  has_sibling_discount: z.boolean().optional().default(false),
  sibling_discount_percent: percentSchema,

  // Инфраструктура
  has_cafeteria: z.boolean().optional().default(false),
  has_gym: z.boolean().optional().default(false),
  has_swimming_pool: z.boolean().optional().default(false),
  has_football_field: z.boolean().optional().default(false),
  has_library: z.boolean().optional().default(false),
  has_computer_lab: z.boolean().optional().default(false),
  has_science_labs: z.boolean().optional().default(false),
  has_medical_room: z.boolean().optional().default(false),
  has_cctv: z.boolean().optional().default(false),
  has_security_24_7: z.boolean().optional().default(false),
  school_area_sqm: positiveNumberSchema,
  classrooms_count: z.number().int().min(1).max(500).nullable().optional(),

  // Расписание
  school_start_time: z.string().max(10).nullable().optional(),
  school_end_time: z.string().max(10).nullable().optional(),
  lesson_duration: z.number().int().min(30).max(90).nullable().optional(),
  lessons_per_day: z.number().int().min(1).max(12).nullable().optional(),
  has_saturday_classes: z.boolean().optional().default(false),

  // Педагогический состав
  total_teachers: z.number().int().min(0).max(1000).nullable().optional(),
  total_students: z.number().int().min(0).max(10000).nullable().optional(),
  avg_class_size: z.number().int().min(1).max(50).nullable().optional(),
  avg_teacher_experience_years: z.number().min(0).max(50).nullable().optional(),
  teachers_with_higher_ed_percent: percentSchema,
  has_psychologist: z.boolean().optional().default(false),
  has_foreign_teachers: z.boolean().optional().default(false),
  native_english_speakers_count: z.number().int().min(0).max(100).nullable().optional(),

  // Лицензия и аккредитация
  license_number: z.string().max(100).nullable().optional(),
  license_date: z.string().max(20).nullable().optional(),
  license_valid_until: z.string().max(20).nullable().optional(),
  license_authority: z.string().max(255).nullable().optional(),
  has_international_accreditation: z.boolean().optional().default(false),
  accreditation_body: z.string().max(255).nullable().optional(),

  // Внеклассные активности
  extracurricular_activities: stringArraySchema,
  sports_sections: stringArraySchema,
  clubs: stringArraySchema,
});

/**
 * Схема обновления деталей школы
 */
export const updateSchoolDetailsSchema = createSchoolDetailsSchema
  .partial()
  .omit({ organization_id: true });

/**
 * Типы
 */
export type CreateSchoolDetailsInput = z.infer<typeof createSchoolDetailsSchema>;
export type UpdateSchoolDetailsInput = z.infer<typeof updateSchoolDetailsSchema>;
export type PricingTier = z.infer<typeof pricingTierSchema>;

/**
 * Функция валидации с детальными ошибками
 */
export function validateSchoolDetails(
  data: unknown,
  isUpdate = false
): { success: true; data: CreateSchoolDetailsInput | UpdateSchoolDetailsInput } | { success: false; errors: string[] } {
  const schema = isUpdate ? updateSchoolDetailsSchema : createSchoolDetailsSchema;
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

/**
 * Валидация полной школы (организация + детали)
 */
export const createSchoolSchema = z.object({
  organization: z.object({
    name: z.string().min(2).max(255),
    name_uz: z.string().min(2).max(255).nullable().optional(),
    name_ru: z.string().max(255).nullable().optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(100),
    org_type: z.literal('school'),
    description: z.string().max(5000).nullable().optional(),
    status: z.enum(['draft', 'pending', 'published', 'rejected', 'suspended']).optional(),
    phone: z.string().nullable().optional(),
    phone_secondary: z.string().nullable().optional(),
    phone_secondary_comment: z.string().max(100).nullable().optional(),
    phone_admission: z.string().nullable().optional(),
    phone_admission_comment: z.string().max(100).nullable().optional(),
    email: z.string().email().nullable().optional(),
    website: z.string().url().nullable().optional(),
    telegram: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
    facebook: z.string().nullable().optional(),
    youtube: z.string().nullable().optional(),
    region_id: z.number().int().positive().nullable().optional(),
    district_id: z.number().int().positive().nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    landmark: z.string().max(255).nullable().optional(),
    lat: z.number().min(-90).max(90).nullable().optional(),
    lng: z.number().min(-180).max(180).nullable().optional(),
    logo_url: z.string().nullable().optional(),
    banner_url: z.string().nullable().optional(),
    brand_id: z.string().uuid().nullable().optional(),
    admin_user_id: z.string().uuid().nullable().optional(),
  }),
  school_details: z.object({
    school_type: z.enum(['private', 'state', 'international']),
    grade_from: z.number().int().min(0).max(11).optional(),
    grade_to: z.number().int().min(1).max(11).optional(),
    accepts_preparatory: z.boolean().optional(),
    accepted_grades: z.array(z.number().int().min(0).max(11)).nullable().optional(),
    primary_language: z.enum(['uzbek', 'russian', 'english', 'kazakh', 'tajik', 'karakalpak']).optional(),
    additional_languages: z.array(z.string()).nullable().optional(),
    curriculum: z.array(z.string()).nullable().optional(),
    fee_monthly_min: z.number().min(0).nullable().optional(),
    fee_monthly_max: z.number().min(0).nullable().optional(),
    pricing_tiers: z.array(pricingTierSchema).nullable().optional(),
  }),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

export function validateCreateSchool(
  data: unknown
): { success: true; data: CreateSchoolInput } | { success: false; errors: string[] } {
  const result = createSchoolSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}
