# Документация по оптимизации EduMap.uz

**Дата:** 2025-12-22
**Версия:** 1.0
**Основание:** TZ_OPTIMIZATION.md

---

## Содержание

1. [Обзор изменений](#1-обзор-изменений)
2. [Zod валидация API](#2-zod-валидация-api)
3. [Синхронизация типов БД](#3-синхронизация-типов-бд)
4. [Слой сервисов](#4-слой-сервисов)
5. [Batch API для N+1 проблемы](#5-batch-api-для-n1-проблемы)
6. [Rate Limiting](#6-rate-limiting)
7. [Исправление any типов](#7-исправление-any-типов)
8. [SQL миграция для транзакций](#8-sql-миграция-для-транзакций)
9. [Рекомендации по дальнейшему развитию](#9-рекомендации-по-дальнейшему-развитию)

---

## 1. Обзор изменений

### Что было сделано:

| Задача | Статус | Файлы |
|--------|--------|-------|
| Zod валидация на API endpoints | ✅ Готово | `src/lib/validation/schemas/*` |
| Синхронизация типов БД | ✅ Готово | `src/types/database.ts` |
| SQL транзакции (RPC) | ✅ Готово | `supabase/migrations/041_*.sql` |
| Слой сервисов | ✅ Готово | `src/lib/services/*` |
| Batch API (N+1 fix) | ✅ Готово | `src/app/api/storage/batch-urls/route.ts` |
| Хелперы для дублирования | ✅ Готово | `src/lib/utils/school-helpers.ts` |
| Rate Limiting | ✅ Готово | `src/lib/utils/rate-limit.ts` |
| Исправление any типов | ✅ Готово | 20+ файлов |

---

## 2. Zod валидация API

### Почему это важно
- Предотвращает SQL-инъекции через JSONB поля
- Защищает от XSS через текстовые поля
- Гарантирует корректность данных в БД
- Предоставляет понятные сообщения об ошибках

### Созданные файлы

#### `src/lib/validation/schemas/common.ts`
Общие схемы валидации:
```typescript
export const phoneSchema = z.string().regex(/^\+998[0-9]{9}$/);
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/).min(2).max(100);
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().max(255);
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export const organizationStatusSchema = z.enum([
  'draft', 'pending', 'published', 'rejected', 'suspended'
]);
```

#### `src/lib/validation/schemas/organization.ts`
Схема для организаций с полной валидацией всех полей.

#### `src/lib/validation/schemas/school-details.ts`
Схема для деталей школы + объединённая схема создания школы:
```typescript
export const createSchoolSchema = z.object({
  organization: z.object({...}),
  school_details: z.object({...}),
});

export function validateCreateSchool(data: unknown): ValidationResult
```

#### `src/lib/validation/schemas/user.ts`
Схемы для пользователей, ролей, регистрации.

### Использование в API

```typescript
// src/app/api/admin/schools/route.ts
import { validateCreateSchool } from '@/lib/validation/schemas/school-details';

export async function POST(request: Request) {
  const body = await request.json();
  const validation = validateCreateSchool(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.errors },
      { status: 400 }
    );
  }

  // validation.data уже типизирован
  const { organization, school_details } = validation.data;
}
```

---

## 3. Синхронизация типов БД

### Проблема
Типы в `src/types/database.ts` не включали таблицы `regions` и `districts`, которые реально используются в БД.

### Решение
Добавлены недостающие типы:

```typescript
// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      regions: {
        Row: {
          id: number;
          name: string;
          name_uz: string | null;
          name_ru: string | null;
          code: string | null;
          created_at: string;
        };
        Insert: {...};
        Update: {...};
      };
      districts: {
        Row: {
          id: number;
          region_id: number;
          name: string;
          name_uz: string | null;
          name_ru: string | null;
          created_at: string;
        };
        Insert: {...};
        Update: {...};
      };
      school_sections_progress: {...};
    };
  };
}
```

Также добавлены поля `region_id` и `district_id` в тип `organizations`.

---

## 4. Слой сервисов

### Почему это важно
- Централизация бизнес-логики
- Избежание дублирования кода
- Лёгкое тестирование
- Разделение ответственности

### Созданные файлы

#### `src/lib/services/school.service.ts`
```typescript
export class SchoolService {
  // Создание школы с автоматической генерацией slug
  static async create(dto: CreateSchoolDTO): Promise<{ id: string; slug: string }>

  // Обновление школы
  static async update(schoolId: string, dto: Partial<CreateSchoolDTO>): Promise<{ id: string }>

  // Получение по ID/slug
  static async getById(id: string): Promise<SchoolWithDetails | null>
  static async getBySlug(slug: string): Promise<SchoolWithDetails | null>

  // Удаление
  static async delete(id: string): Promise<void>

  // Проверка уникальности slug
  static async isSlugUnique(slug: string, excludeId?: string): Promise<boolean>
}
```

Сервис включает:
- Автоматическую нормализацию данных (телефоны, соцсети, сайты)
- Генерацию уникальных slug
- Откат при ошибках (pseudo-транзакции)

#### `src/lib/services/storage.service.ts`
```typescript
export class StorageService {
  // Batch получение URLs (решает N+1)
  static async getBatchUrls(keys: string[], preferThumbnails = true)

  // Загрузка файла
  static async upload(file: Buffer, options: UploadOptions)

  // Удаление файла
  static async delete(key: string)
}
```

#### `src/lib/utils/school-helpers.ts`
Хелперы для устранения дублирования:
```typescript
// Нормализация school_details (массив -> объект)
export function getSchoolDetails(school: SchoolWithDetails): SchoolDetails | null

// Проверка фильтров
export function matchesFilters(school: SchoolWithDetails, filters: Filters): boolean

// Константы для UI
export const SCHOOL_TYPE_LABELS = {...};
export const LANGUAGE_LABELS = {...};
export const CURRICULUM_LABELS = {...};
```

---

## 5. Batch API для N+1 проблемы

### Проблема
При отображении списка школ каждая карточка делала отдельный запрос для получения presigned URL изображения. Для 20 школ = 20 запросов.

### Решение

#### `src/app/api/storage/batch-urls/route.ts`
```typescript
// POST /api/storage/batch-urls
// Body: { keys: string[], preferThumbnails?: boolean }
// Response: { urls: { [key: string]: string | null } }

const requestSchema = z.object({
  keys: z.array(z.string().max(500)).max(50), // Макс 50 ключей за раз
  preferThumbnails: z.boolean().optional().default(true),
});
```

Особенности:
- Кэширование URLs на 25 минут (меньше TTL presigned URL)
- Ограничение concurrency (по 10 параллельно)
- Автоматический fallback на оригинал если нет thumbnail
- Очистка старых записей при переполнении кэша

### Использование
```typescript
const keys = schools.map(s => s.logo_url).filter(Boolean);
const response = await fetch('/api/storage/batch-urls', {
  method: 'POST',
  body: JSON.stringify({ keys, preferThumbnails: true }),
});
const { urls } = await response.json();
// urls['logos/123/logo.webp'] = 'https://signed-url...'
```

---

## 6. Rate Limiting

### Почему это важно
- Защита от DDoS атак
- Предотвращение abuse API
- Контроль нагрузки на сервер

### Созданные файлы

#### `src/lib/utils/rate-limit.ts`
```typescript
export interface RateLimitConfig {
  windowMs: number;      // Окно времени
  maxRequests: number;   // Макс запросов в окне
}

export const RATE_LIMITS = {
  api: { windowMs: 60_000, maxRequests: 100 },      // 100 req/min
  upload: { windowMs: 60_000, maxRequests: 10 },    // 10 uploads/min
  auth: { windowMs: 900_000, maxRequests: 5 },      // 5 attempts/15min
  search: { windowMs: 60_000, maxRequests: 30 },    // 30 searches/min
  heavy: { windowMs: 60_000, maxRequests: 5 },      // 5 heavy ops/min
};

export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult
export function createRateLimitKey(request: Request, prefix: string, userId?: string): string
```

### Применение в API

```typescript
// src/app/api/upload/route.ts
import { checkRateLimit, createRateLimitKey, RATE_LIMITS } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  const user = await getCurrentUser();

  // Rate limiting
  const rateLimitKey = createRateLimitKey(request, 'upload', user.id);
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.upload);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: rateLimit.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.retryAfter / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMITS.upload.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        }
      }
    );
  }

  // ... обработка загрузки
}
```

---

## 7. Исправление any типов

### Проблема
В проекте было ~60+ мест с `any` типами, что снижает безопасность типов и усложняет рефакторинг.

### Исправленные файлы

| Файл | Было | Стало |
|------|------|-------|
| `error-handler.ts` | `error: any` | `error: unknown` с type guards |
| `TeachersForm.tsx` | `organization: any` | Типизированный интерфейс |
| `ResultsForm.tsx` | `initialResults: any[]` | `YearlyResult[]` |
| `MediaManager.tsx` | `catch (err: any)` | `catch (err)` + instanceof |
| `use-region-district.ts` | `catch (err: any)` | `err instanceof Error` |
| `autosave.ts` | `data: any` | Generic `<T = unknown>` |
| `section-validators.ts` | `data: any` | Типизированные интерфейсы |
| `progress-calculator.ts` | `[key: string]: any` | Union types |
| `yandex-client.ts` | `error: any` | Type assertion |
| `SchoolForm.tsx` | `organization?: any` | `OrganizationData` |
| `SchoolCreationForm.tsx` | `regions: any[]` | Типизированные массивы |
| `[slug]/page.tsx` | `school: any` | `ReturnType<typeof getSchool>` |

### Паттерны исправления

#### 1. Catch блоки
```typescript
// Было
} catch (err: any) {
  setError(err.message);
}

// Стало
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

#### 2. Unknown объекты
```typescript
// Было
function parseError(error: any): AdminError {
  if (error.code && error.message) {...}
}

// Стало
function parseError(error: unknown): AdminError {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err.code === 'string' && typeof err.message === 'string') {...}
  }
}
```

#### 3. Generics
```typescript
// Было
interface UseAutosaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
}

// Стало
interface UseAutosaveOptions<T = unknown> {
  data: T;
  onSave: (data: T) => Promise<void>;
}
```

---

## 8. SQL миграция для транзакций

### Файл: `supabase/migrations/041_school_crud_functions.sql`

Созданы RPC функции для атомарных операций:

```sql
-- Создание школы с деталями в одной транзакции
CREATE OR REPLACE FUNCTION create_school_with_details(
  p_organization JSONB,
  p_school_details JSONB
) RETURNS JSONB AS $$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  -- Генерация уникального slug
  v_slug := generate_unique_slug(p_organization->>'name_uz');

  -- Создание организации
  INSERT INTO organizations (...)
  VALUES (...)
  RETURNING id INTO v_org_id;

  -- Создание school_details
  INSERT INTO school_details (organization_id, ...)
  VALUES (v_org_id, ...);

  RETURN jsonb_build_object('id', v_org_id, 'slug', v_slug);
END;
$$ LANGUAGE plpgsql;

-- Обновление школы с деталями
CREATE OR REPLACE FUNCTION update_school_with_details(
  p_school_id UUID,
  p_organization JSONB,
  p_school_details JSONB
) RETURNS JSONB AS $$
...
$$ LANGUAGE plpgsql;
```

### Применение миграции
```bash
supabase db push
# или
psql -h <host> -U <user> -d <db> -f supabase/migrations/041_school_crud_functions.sql
```

После применения миграции можно обновить `SchoolService` для использования RPC:
```typescript
const { data, error } = await supabase.rpc('create_school_with_details', {
  p_organization: organizationData,
  p_school_details: schoolDetailsData,
});
```

---

## 9. Рекомендации по дальнейшему развитию

### Приоритет 1: Безопасность
1. [ ] Применить SQL миграцию для транзакций
2. [ ] Добавить CSRF защиту
3. [ ] Внедрить Content Security Policy
4. [ ] Аудит RLS политик в Supabase

### Приоритет 2: Производительность
1. [ ] Добавить Redis для кэширования (вместо in-memory)
2. [ ] Настроить CDN для статики
3. [ ] Внедрить ISR для страниц школ
4. [ ] Оптимизировать bundle size

### Приоритет 3: Качество кода
1. [ ] Написать unit тесты для сервисов
2. [ ] Добавить E2E тесты для критических путей
3. [ ] Настроить pre-commit hooks (lint, format)
4. [ ] Внедрить Storybook для UI компонентов

### Приоритет 4: Мониторинг
1. [ ] Настроить Sentry для отслеживания ошибок
2. [ ] Добавить метрики производительности
3. [ ] Настроить алерты для критических событий

---

## Итоги

Выполненные оптимизации значительно повышают:
- **Безопасность** — валидация входных данных, rate limiting
- **Производительность** — batch API, оптимизированные запросы
- **Качество кода** — строгая типизация, слой сервисов
- **Поддерживаемость** — централизованная логика, переиспользуемые компоненты

Билд проекта проходит успешно после всех изменений.
