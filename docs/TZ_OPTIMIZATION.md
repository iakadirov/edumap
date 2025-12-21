# Техническое задание на улучшение и оптимизацию EduMap.uz

**Дата:** 2025-12-21
**Версия:** 1.0
**Автор:** Claude (анализ кодовой базы)

---

## Содержание

1. [Краткий обзор проекта](#1-краткий-обзор-проекта)
2. [Критические проблемы (Priority 1)](#2-критические-проблемы-priority-1)
3. [Архитектурные проблемы (Priority 2)](#3-архитектурные-проблемы-priority-2)
4. [Проблемы производительности (Priority 3)](#4-проблемы-производительности-priority-3)
5. [Проблемы безопасности (Priority 4)](#5-проблемы-безопасности-priority-4)
6. [Проблемы качества кода (Priority 5)](#6-проблемы-качества-кода-priority-5)
7. [UX/UI улучшения (Priority 6)](#7-uxui-улучшения-priority-6)
8. [План реализации](#8-план-реализации)

---

## 1. Краткий обзор проекта

**EduMap.uz** — образовательная платформа для Узбекистана, помогающая родителям находить школы через прозрачные данные и отзывы.

### Технологический стек:
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL), API Routes
- **Storage:** Yandex Cloud Storage (S3-compatible)
- **UI:** shadcn/ui, Lucide Icons, Solar Icons

---

## 2. Критические проблемы (Priority 1)

### 2.1 Отсутствие валидации входных данных на сервере

**Проблема:**
В `src/app/api/admin/schools/[id]/route.ts:17-18` данные из `request.json()` используются напрямую без валидации:

```typescript
const body = await request.json();
const { organization, school_details } = body;
// Данные сразу идут в БД без проверки типов и формата
```

**Риск:** SQL-инъекции через JSONB поля, XSS через текстовые поля, некорректные данные в БД.

**Решение:**
- Внедрить Zod для валидации схем на всех API endpoints
- Создать централизованные схемы валидации в `src/lib/validation/`

```typescript
// src/lib/validation/school.ts
import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(2).max(255),
  name_uz: z.string().min(2).max(255).nullable(),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  phone: z.string().regex(/^\+998[0-9]{9}$/).nullable(),
  email: z.string().email().nullable(),
  // ... остальные поля
});
```

---

### 2.2 Отсутствие транзакций при обновлении связанных данных

**Проблема:**
В `src/app/api/admin/schools/[id]/route.ts:57-107` обновление `organizations` и `school_details` происходит отдельными запросами без транзакции:

```typescript
const { error: orgError } = await supabase
  .from('organizations')
  .update(organization)
  .eq('id', id);

// Если здесь произойдет ошибка, данные будут частично обновлены
const { error: detailsError } = await supabase
  .from('school_details')
  .update(school_details)
  .eq('organization_id', id);
```

**Риск:** Несогласованность данных при частичных ошибках.

**Решение:**
- Использовать RPC функции PostgreSQL для атомарных операций
- Или использовать Supabase Edge Functions с транзакциями

```sql
-- supabase/migrations/041_school_update_function.sql
CREATE OR REPLACE FUNCTION update_school_with_details(
  p_school_id UUID,
  p_organization JSONB,
  p_school_details JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE organizations SET ... WHERE id = p_school_id;

  UPDATE school_details SET ... WHERE organization_id = p_school_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$ LANGUAGE plpgsql;
```

---

### 2.3 Типы базы данных не синхронизированы

**Проблема:**
В `src/types/database.ts` отсутствуют таблицы `regions` и `districts`, которые используются в коде:

```typescript
// src/lib/supabase/queries.ts:573
let districtsQuery = (supabase as any)  // Используется any!
  .from('districts')
  .select(`id, name_uz, name_ru, ...`);
```

**Риск:** Отсутствие типобезопасности, ошибки в runtime.

**Решение:**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## 3. Архитектурные проблемы (Priority 2)

### 3.1 Дублирование логики фильтрации на клиенте

**Проблема:**
В `src/lib/supabase/queries.ts:321-467` много фильтров применяются на клиенте после получения данных:

```typescript
// Фильтрация на клиенте для сложных фильтров
let filteredData = [...data];

// School type
if (filters.school_type) {
  filteredData = filteredData.filter((school: any) => {
    // ... клиентская фильтрация
  });
}
```

**Проблема:**
- Неэффективно — загружаем больше данных, чем нужно
- Лимит `100` записей может отфильтровать нужные данные
- Нет пагинации с учетом фильтров

**Решение:**
- Создать PostgreSQL View или функцию для фильтрации
- Использовать JOIN вместо клиентской фильтрации

```sql
-- Создать view для школ с деталями
CREATE VIEW schools_with_details AS
SELECT
  o.*,
  sd.school_type,
  sd.fee_monthly_min,
  sd.fee_monthly_max,
  sd.primary_language,
  sd.curriculum,
  sd.has_transport,
  sd.has_meals
FROM organizations o
LEFT JOIN school_details sd ON sd.organization_id = o.id
WHERE o.org_type = 'school';
```

---

### 3.2 Смешение языков в UI (Русский/Узбекский)

**Проблема:**
В `src/components/admin/schools/SchoolsTable.tsx` и других компонентах смешаны языки:

```typescript
// Русский
const labels: Record<string, string> = {
  draft: 'Черновик',
  pending: 'На модерации',
  published: 'Опубликована',
};

// Узбекский в том же файле
<Button>O'chirish</Button>
<SelectItem value="all">Barchasi</SelectItem>
```

**Решение:**
- Создать единую систему локализации
- Использовать `next-intl` или `i18next`
- Все строки вынести в JSON файлы

```typescript
// src/i18n/uz.json
{
  "admin": {
    "schools": {
      "status": {
        "draft": "Qoralama",
        "pending": "Tekshiruvda",
        "published": "Nashr qilingan"
      }
    }
  }
}
```

---

### 3.3 Нет четкого разделения Server/Client компонентов

**Проблема:**
`SchoolCard` (`src/components/schools/SchoolCard.tsx`) помечен как `'use client'`, но выполняет fetch в useEffect:

```typescript
'use client';

useEffect(() => {
  getThumbnailUrl(school.logo_url, true)
    .then((thumbnailUrl) => {
      setLogoUrl(thumbnailUrl);
    });
}, [school.id, school.logo_url]);
```

**Проблема:**
- Дополнительные запросы на каждую карточку при рендере
- Мерцание при загрузке изображений
- Нагрузка на API storage/url

**Решение:**
- Предварительно генерировать thumbnail URLs на сервере
- Кэшировать thumbnail URLs в БД

```typescript
// Server Component
async function SchoolCardWrapper({ school }: Props) {
  const thumbnailUrls = await getPreloadedThumbnails(school);
  return <SchoolCard school={school} thumbnails={thumbnailUrls} />;
}
```

---

### 3.4 Отсутствие слоя сервисов

**Проблема:**
Бизнес-логика разбросана между API routes и компонентами. Нет единого места для:
- Валидации бизнес-правил
- Трансформации данных
- Кэширования

**Решение:**
Создать слой сервисов:

```
src/lib/services/
├── school.service.ts      # Операции со школами
├── brand.service.ts       # Операции с брендами
├── user.service.ts        # Операции с пользователями
├── storage.service.ts     # Работа с файлами
└── index.ts
```

```typescript
// src/lib/services/school.service.ts
export class SchoolService {
  static async create(data: CreateSchoolDTO): Promise<School> {
    // Валидация
    const validated = schoolSchema.parse(data);

    // Генерация slug
    const slug = await this.generateUniqueSlug(validated.name_uz);

    // Сохранение
    return await schoolRepository.create({ ...validated, slug });
  }
}
```

---

## 4. Проблемы производительности (Priority 3)

### 4.1 N+1 проблема при получении thumbnail URLs

**Проблема:**
Для каждой школы в списке делается отдельный запрос к `/api/storage/url`:

```typescript
// SchoolCard.tsx
useEffect(() => {
  // 2 запроса на каждую карточку
  getThumbnailUrl(school.logo_url, true);
  getThumbnailUrl(school.cover_image_url, true);
}, [...]);
```

При 20 школах = 40 запросов к API.

**Решение:**
1. Batch API для получения нескольких URL за один запрос:

```typescript
// POST /api/storage/urls
{
  "keys": ["logos/1/logo.jpg", "covers/1/cover.jpg", ...]
}
```

2. Или кэширование URLs в Redis/DB при загрузке

---

### 4.2 Отсутствие кэширования API responses

**Проблема:**
API routes не используют кэширование Next.js:

```typescript
// src/app/api/schools/list/route.ts
export async function GET(request: Request) {
  // Каждый запрос идет в БД
  const schools = await getSchoolsWithFilters(filters);
}
```

**Решение:**
```typescript
export async function GET(request: Request) {
  const cacheKey = generateCacheKey(filters);

  return unstable_cache(
    async () => getSchoolsWithFilters(filters),
    [cacheKey],
    { revalidate: 60, tags: ['schools'] }
  )();
}
```

---

### 4.3 Большие бандлы клиентских компонентов

**Проблема:**
В `SchoolCreationForm.tsx` (540 строк) импортируются все секции сразу:

```typescript
import { BasicInfoSection } from './forms/BasicInfoSection';
import { ContactsSection } from './forms/ContactsSection';
import { EducationSection } from './forms/EducationSection';
```

**Решение:**
- Использовать dynamic imports для секций
- Разбить форму на шаги с lazy loading

```typescript
const BasicInfoSection = dynamic(
  () => import('./forms/BasicInfoSection'),
  { loading: () => <FormSkeleton /> }
);
```

---

### 4.4 Неоптимальные запросы к БД

**Проблема:**
В `getSchoolsWithFilters` выбираются ВСЕ поля, хотя для карточки нужно только ~15:

```typescript
.select(`
  id, name, name_uz, name_ru, slug, description, short_description,
  status, overall_rating, reviews_count, is_verified, city, district,
  region_id, district_id, address, phone, email, website, logo_url,
  cover_image_url, is_verified, org_type, ...
`)
```

**Решение:**
- Создать отдельный DTO для списка
- Минимизировать выборку

```typescript
const SCHOOL_LIST_FIELDS = `
  id, name, name_uz, slug, logo_url, cover_image_url,
  overall_rating, reviews_count, is_verified, district_id,
  school_details(school_type, fee_monthly_min, primary_language)
`;
```

---

## 5. Проблемы безопасности (Priority 4)

### 5.1 Кэширование роли пользователя в памяти middleware

**Проблема:**
В `src/middleware.ts:6-35` используется in-memory кэш:

```typescript
const userCache = new Map<string, { role: string; is_active: boolean; expires: number }>();
```

**Риски:**
- При нескольких инстансах кэш не синхронизирован
- Пользователь с отозванными правами сохраняет доступ до 30 секунд
- Memory leak при большом количестве пользователей

**Решение:**
- Использовать Redis для кэша
- Или проверять роль при каждом критичном запросе
- Добавить механизм инвалидации при изменении роли

---

### 5.2 Отсутствие Rate Limiting

**Проблема:**
API endpoints не защищены от abuse:

```typescript
// /api/upload может быть вызван неограниченное количество раз
export async function POST(request: NextRequest) {
  // Нет проверки rate limit
}
```

**Решение:**
- Использовать `@upstash/ratelimit` или подобное
- Добавить middleware для rate limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // ...
}
```

---

### 5.3 Presigned URLs с длительным сроком

**Проблема:**
В `src/app/api/upload/route.ts:154`:

```typescript
const url = await getFileUrl(key, 3600); // 1 час
```

После загрузки URL действителен целый час и может быть перехвачен.

**Решение:**
- Уменьшить TTL до 5-15 минут
- Использовать одноразовые URL для sensitive данных
- Для публичного контента рассмотреть CDN

---

### 5.4 Хранение путей к файлам без санитизации

**Проблема:**
В `src/app/api/upload/route.ts:134`:

```typescript
const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
key = `documents/${organizationId}/${sanitizedName}`;
```

Санитизация есть, но нет проверки на path traversal (`../`).

**Решение:**
```typescript
import path from 'path';

function sanitizeFilePath(organizationId: string, fileName: string): string {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fullPath = `documents/${organizationId}/${sanitizedName}`;

  // Проверка на path traversal
  const normalized = path.normalize(fullPath);
  if (!normalized.startsWith('documents/')) {
    throw new Error('Invalid file path');
  }

  return normalized;
}
```

---

## 6. Проблемы качества кода (Priority 5)

### 6.1 Использование `any` типов

**Проблема:**
Множество мест с `any`:

```typescript
// src/lib/supabase/queries.ts:326
filteredData = filteredData.filter((school: any) => {

// src/components/admin/schools/SchoolCreationForm.tsx:59
const [regions, setRegions] = useState<any[]>([]);

// src/lib/auth/permissions.ts:88
supabase: any
```

**Решение:**
- Создать типы для всех сущностей
- Заменить `any` на конкретные типы
- Включить `"noImplicitAny": true` в tsconfig

---

### 6.2 Дублирование кода обработки school_details

**Проблема:**
Один и тот же паттерн повторяется ~20 раз:

```typescript
const details = Array.isArray(school.school_details)
  ? school.school_details[0]
  : school.school_details;
```

**Решение:**
```typescript
// src/lib/utils/school-transform.ts
export function getSchoolDetails(school: SchoolWithDetails): SchoolDetails | null {
  if (!school.school_details) return null;
  return Array.isArray(school.school_details)
    ? school.school_details[0]
    : school.school_details;
}
```

---

### 6.3 Отсутствие тестов

**Проблема:**
В проекте нет тестов. При 100+ компонентах и 40+ API endpoints это критично.

**Решение:**
1. Настроить Vitest для unit тестов
2. Настроить Playwright для E2E тестов
3. Приоритезировать тесты для:
   - API endpoints (валидация, авторизация)
   - Критичных форм (SchoolCreationForm)
   - Фильтрации школ

```typescript
// __tests__/api/schools.test.ts
describe('POST /api/admin/schools', () => {
  it('should reject unauthorized requests', async () => {
    const response = await fetch('/api/admin/schools', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(401);
  });
});
```

---

### 6.4 eslint-disable-next-line без объяснений

**Проблема:**
Много отключений ESLint без причины:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [brandId]);
```

**Решение:**
- Добавить комментарии с объяснением
- Или исправить зависимости

```typescript
// Намеренно вызываем только при изменении brandId,
// чтобы не перезаписывать данные при каждом изменении data
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [brandId]);
```

---

## 7. UX/UI улучшения (Priority 6)

### 7.1 Мерцание изображений при загрузке

**Проблема:**
`SchoolCard` показывает пустое место, пока загружается thumbnail URL.

**Решение:**
- Добавить skeleton loader
- Использовать `placeholder="blur"` в Next/Image
- Preload критичных изображений

---

### 7.2 Отсутствие обработки ошибок для пользователя

**Проблема:**
В `SchoolsTable.tsx:229`:

```typescript
} else {
  alert('Xatolik yuz berdi');  // Нативный alert без деталей
}
```

**Решение:**
- Использовать Toast notifications везде
- Показывать понятные сообщения об ошибках
- Логировать ошибки в Sentry/LogRocket

---

### 7.3 Нет индикации загрузки при фильтрации

**Проблема:**
При изменении фильтров школ нет индикации загрузки.

**Решение:**
- Добавить skeleton loader при загрузке
- Использовать `useTransition` для pending state

---

### 7.4 Форма создания школы слишком длинная

**Проблема:**
`SchoolCreationForm` показывает все секции сразу, что создает cognitive overload.

**Решение:**
- Разбить на пошаговый wizard с прогрессом
- Показывать одну секцию за раз
- Добавить валидацию на каждом шаге

---

## 8. План реализации

### Фаза 1: Критические исправления (1-2 недели)

| # | Задача | Файлы | Приоритет |
|---|--------|-------|-----------|
| 1 | Добавить Zod валидацию на API | `src/app/api/**/*.ts` | P1 |
| 2 | Синхронизировать типы БД | `src/types/database.ts` | P1 |
| 3 | Добавить транзакции для связанных данных | `src/app/api/admin/schools/` | P1 |

### Фаза 2: Архитектурные улучшения (2-3 недели)

| # | Задача | Файлы | Приоритет |
|---|--------|-------|-----------|
| 4 | Создать слой сервисов | `src/lib/services/` | P2 |
| 5 | Перенести фильтрацию на сервер | `src/lib/supabase/queries.ts` | P2 |
| 6 | Унифицировать локализацию | `src/i18n/`, все компоненты | P2 |

### Фаза 3: Производительность (1-2 недели)

| # | Задача | Файлы | Приоритет |
|---|--------|-------|-----------|
| 7 | Batch API для thumbnail URLs | `src/app/api/storage/` | P3 |
| 8 | Добавить кэширование API | `src/app/api/**/*.ts` | P3 |
| 9 | Dynamic imports для форм | `src/components/admin/schools/` | P3 |

### Фаза 4: Безопасность (1 неделя)

| # | Задача | Файлы | Приоритет |
|---|--------|-------|-----------|
| 10 | Добавить rate limiting | `src/middleware.ts` | P4 |
| 11 | Улучшить кэширование ролей | `src/middleware.ts` | P4 |
| 12 | Уменьшить TTL presigned URLs | `src/lib/storage/` | P4 |

### Фаза 5: Качество кода (Ongoing)

| # | Задача | Файлы | Приоритет |
|---|--------|-------|-----------|
| 13 | Убрать все `any` типы | Весь проект | P5 |
| 14 | Настроить тестирование | Новые файлы | P5 |
| 15 | Добавить CI/CD с тестами | `.github/workflows/` | P5 |

---

## Заключение

Проект EduMap.uz имеет хорошую базовую структуру и использует современный стек технологий. Однако для production-ready состояния необходимо:

1. **Срочно** исправить отсутствие валидации и транзакций
2. **Важно** оптимизировать производительность фильтрации и загрузки изображений
3. **Необходимо** унифицировать локализацию и добавить тестирование

При последовательной реализации этих улучшений платформа станет надежной, безопасной и производительной.
