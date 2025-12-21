/**
 * Общие схемы валидации
 */

import { z } from 'zod';

// Узбекский номер телефона: +998XXXXXXXXX
export const phoneSchema = z
  .string()
  .regex(/^\+998[0-9]{9}$/, 'Telefon raqami noto\'g\'ri formatda (+998XXXXXXXXX)')
  .nullable()
  .optional();

// Или номер без +998 (9 цифр)
export const phoneWithoutCodeSchema = z
  .string()
  .regex(/^[0-9]{9}$/, 'Telefon raqami 9 ta raqamdan iborat bo\'lishi kerak')
  .nullable()
  .optional();

// Email
export const emailSchema = z
  .string()
  .email('Email manzili noto\'g\'ri')
  .max(255)
  .nullable()
  .optional();

// URL
export const urlSchema = z
  .string()
  .url('URL manzili noto\'g\'ri')
  .max(500)
  .nullable()
  .optional();

// Slug (URL-friendly)
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug faqat kichik harflar, raqamlar va chiziqcha bo\'lishi mumkin')
  .min(2)
  .max(100);

// UUID
export const uuidSchema = z
  .string()
  .uuid('ID noto\'g\'ri formatda');

// Положительное число
export const positiveNumberSchema = z
  .union([
    z.number().positive('Raqam musbat bo\'lishi kerak'),
    z.null(),
    z.undefined(),
  ])
  .optional();

// Год (разумный диапазон)
export const yearSchema = z
  .number()
  .int()
  .min(1900)
  .max(new Date().getFullYear() + 1)
  .nullable()
  .optional();

// Процент (0-100)
export const percentSchema = z
  .union([
    z.number().min(0).max(100),
    z.null(),
    z.undefined(),
  ])
  .optional();

// Координаты
export const latitudeSchema = z
  .number()
  .min(-90)
  .max(90)
  .nullable()
  .optional();

export const longitudeSchema = z
  .number()
  .min(-180)
  .max(180)
  .nullable()
  .optional();

// Социальные сети (username без @)
export const socialUsernameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Username noto\'g\'ri formatda')
  .max(100)
  .nullable()
  .optional();

// Telegram (может быть username или ссылка)
export const telegramSchema = z
  .string()
  .max(200)
  .nullable()
  .optional();

// Массив строк
export const stringArraySchema = z
  .array(z.string().max(255))
  .nullable()
  .optional();

// Массив чисел
export const numberArraySchema = z
  .array(z.number())
  .nullable()
  .optional();

// Статус организации
export const organizationStatusSchema = z.enum([
  'draft',
  'pending',
  'published',
  'rejected',
  'suspended',
]);

// Тип организации
export const orgTypeSchema = z.enum([
  'school',
  'university',
  'kindergarten',
  'course',
]);

// Тип школы
export const schoolTypeSchema = z.enum([
  'private',
  'state',
  'international',
]);

// Язык обучения
export const languageSchema = z.enum([
  'uzbek',
  'russian',
  'english',
  'kazakh',
  'tajik',
  'karakalpak',
]);

// Учебная программа
export const curriculumSchema = z.enum([
  'national',
  'cambridge',
  'ib',
  'american',
  'russian',
  'mixed',
]);
