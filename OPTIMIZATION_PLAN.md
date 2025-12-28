# План оптимизации и улучшения проекта EduMap

## Обзор анализа

- **Строк кода**: ~38,270 TypeScript/TSX
- **Компонентов**: 105 React компонентов
- **API routes**: 36 маршрутов
- **Оценка качества**: 7/10

---

## Категории улучшений

### 🔴 КРИТИЧЕСКИЙ ПРИОРИТЕТ

#### 1. Исправление ESLint ошибок (346 errors)

**Проблема**: 346 ошибок линтинга блокируют CI/CD

**Файлы для исправления**:

| Категория | Количество | Файлы |
|-----------|-----------|-------|
| `no-explicit-any` | ~80 | `src/lib/supabase/queries.ts`, `src/hooks/use-debounce.ts`, API routes |
| `react/no-unescaped-entities` | ~50 | Страницы с русским текстом и кавычками |
| `no-unused-vars` | ~30 | Компоненты admin, scripts |
| `prefer-const` | ~12 | `src/lib/utils/*.ts` |
| `@next/next/no-html-link-for-pages` | ~10 | `src/app/admin/dashboard/page.tsx` |

**Действия**:
- [ ] Сгенерировать типы для таблицы `districts` в Supabase
- [ ] Заменить `'` на `&apos;` в JSX текстах
- [ ] Удалить неиспользуемые импорты и переменные
- [ ] Заменить `let` на `const` где переменные не переназначаются
- [ ] Заменить `<a>` на `<Link>` для внутренних ссылок

---

#### 2. Устранение дублирования кода

**Проблема**: Код загрузки регионов/районов повторяется в 5+ компонентах

**Файлы с дублированием**:
- `src/components/admin/schools/SchoolCreationWizard.tsx`
- `src/components/admin/schools/SchoolCreationForm.tsx`
- `src/components/admin/schools/BasicInfoForm.tsx`
- `src/components/admin/schools/sections/BasicInfoForm.tsx`
- `src/components/schools/SchoolFilters.tsx`

**Решение**: Использовать существующий хук `useRegionDistrict` везде

```typescript
// БЫЛО (повторяется):
const [regions, setRegions] = useState([]);
useEffect(() => {
  fetch('/data/regions.json').then(r => r.json()).then(setRegions);
}, []);

// СТАЛО:
const { regions, districts, loading } = useRegionDistrict(selectedRegion);
```

---

#### 3. Добавление Error Boundaries

**Проблема**: Нет ни одного ErrorBoundary - ошибка в компоненте крашит всё приложение

**Действия**:
- [ ] Создать `src/components/shared/ErrorBoundary.tsx`
- [ ] Обернуть каждый route segment
- [ ] Создать красивые error.tsx для каждого раздела

---

### 🟡 ВЫСОКИЙ ПРИОРИТЕТ

#### 4. Оптимизация запросов к базе данных

**Проблема A**: Фильтрация на клиенте (100 школ загружаются, потом фильтруются в JS)

**Файл**: `src/lib/supabase/queries.ts:345-380`

```typescript
// БЫЛО:
const { data } = await supabase.from('organizations').select('*').limit(100);
const filteredData = data.filter(school => matchesFilters(school, filters));

// СТАЛО:
let query = supabase.from('organizations').select('*');
if (filters.price_min) query = query.gte('price_min', filters.price_min);
if (filters.curriculum) query = query.contains('curriculums', [filters.curriculum]);
```

**Проблема B**: N+1 запросы в `getDistrictsWithCounts()`

**Файл**: `src/lib/supabase/queries.ts:479-555`

```typescript
// БЫЛО: 2 запроса
const districts = await supabase.from('districts').select();
const counts = await supabase.from('organizations').select('district_id');

// СТАЛО: 1 запрос с JOIN или RPC функция
const { data } = await supabase.rpc('get_districts_with_counts', { region_id });
```

---

#### 5. Улучшение типизации

**Проблема**: 28 файлов используют `any`

**Действия**:
- [ ] Запустить `npx supabase gen types typescript` для обновления типов
- [ ] Добавить типы для таблицы `districts`
- [ ] Создать type guards вместо type assertions

```typescript
// БЫЛО:
const typedUser = user as UserRow;

// СТАЛО:
function isUserRow(data: unknown): data is UserRow {
  return typeof data === 'object' && data !== null && 'id' in data && 'role' in data;
}
if (isUserRow(user)) { /* безопасно использовать */ }
```

---

#### 6. Безопасность

**Проблема A**: Отсутствует CSRF защита

**Решение**: Добавить CSRF токены для мутаций
```typescript
// middleware.ts
import { csrf } from '@/lib/csrf';
export async function middleware(request: NextRequest) {
  return csrf.verify(request);
}
```

**Проблема B**: Нет Rate Limiting

**Решение**: Использовать Upstash Rate Limit или Vercel Rate Limiting
```typescript
// api/*/route.ts
import { Ratelimit } from '@upstash/ratelimit';
const ratelimit = new Ratelimit({ limiter: Ratelimit.slidingWindow(10, '10 s') });
```

**Проблема C**: XSS риски в описаниях школ

**Решение**: Санитизация HTML
```bash
npm install dompurify
```

---

### 🟢 СРЕДНИЙ ПРИОРИТЕТ

#### 7. Мемоизация компонентов

**Проблема**: Только 8 файлов используют React.memo/useMemo

**Компоненты для оптимизации**:
- [ ] `SchoolCard.tsx` - React.memo
- [ ] `SchoolFilters.tsx` - useMemo для options
- [ ] `SchoolsTable.tsx` - React.memo для rows
- [ ] `SimilarSchools.tsx` - React.memo

```typescript
// SchoolCard.tsx
export const SchoolCard = memo(function SchoolCard({ school }: Props) {
  // ...
});
```

---

#### 8. Code Splitting

**Проблема**: YandexMap загружается на всех страницах

**Файл**: `src/components/admin/schools/YandexMap.tsx`

```typescript
// БЫЛО:
import { YandexMap } from '@/components/admin/schools/YandexMap';

// СТАЛО:
const YandexMap = dynamic(
  () => import('@/components/admin/schools/YandexMap'),
  { loading: () => <MapSkeleton />, ssr: false }
);
```

---

#### 9. Логирование

**Проблема**: 208 вызовов console.log/error в production коде

**Решение**: Централизованный logger

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  browser: { asObject: true }
});

// Использование:
logger.error({ err, userId }, 'Failed to load school');
```

---

#### 10. Рефакторинг больших компонентов

**Проблема**: `SchoolCreationWizard.tsx` - 765 строк, 10+ useState

**Решение A**: Разбить на подкомпоненты
```
SchoolCreationWizard/
├── index.tsx (orchestrator)
├── StepNavigation.tsx
├── BasicInfoStep.tsx
├── LocationStep.tsx
├── ContactsStep.tsx
└── hooks/
    └── useSchoolCreation.ts
```

**Решение B**: Использовать useReducer
```typescript
const [state, dispatch] = useReducer(schoolCreationReducer, initialState);
```

---

### 🔵 НИЗКИЙ ПРИОРИТЕТ

#### 11. Добавление тестов

**Текущее состояние**: 0 тестов

**План**:
- [ ] Unit тесты для `src/lib/utils/*.ts`
- [ ] Integration тесты для API routes
- [ ] E2E тесты для критических потоков (Playwright)

```bash
npm install -D vitest @testing-library/react playwright
```

---

#### 12. Виртуализация списков

**Проблема**: При 1000+ школ рендеринг будет медленным

**Решение**: react-window для длинных списков
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList height={600} itemCount={schools.length} itemSize={120}>
  {({ index, style }) => <SchoolCard school={schools[index]} style={style} />}
</FixedSizeList>
```

---

#### 13. State Management

**Проблема**: Prop drilling в глубоких формах

**Решение**: Zustand для сложных форм
```typescript
// src/stores/schoolFormStore.ts
import { create } from 'zustand';

export const useSchoolFormStore = create((set) => ({
  formData: {},
  setField: (field, value) => set(state => ({
    formData: { ...state.formData, [field]: value }
  })),
}));
```

---

#### 14. Удаление неиспользуемого кода

**TODO секции** (23+ комментариев):
- `src/app/(main)/universities/` - заглушки
- `src/app/(main)/kindergartens/` - заглушки
- `src/app/(main)/courses/` - заглушки

**Действие**: Либо реализовать, либо удалить

---

## План выполнения

### Фаза 1: Критические исправления (1-2 дня)
1. ✅ Исправить ESLint ошибки
2. ✅ Устранить дублирование кода
3. ✅ Добавить Error Boundaries

### Фаза 2: Оптимизация (2-3 дня)
4. Оптимизировать запросы к БД
5. Улучшить типизацию
6. Добавить базовую безопасность

### Фаза 3: Улучшения (3-5 дней)
7. Мемоизация компонентов
8. Code splitting
9. Централизованное логирование
10. Рефакторинг больших компонентов

### Фаза 4: Долгосрочные улучшения
11. Покрытие тестами
12. Виртуализация списков
13. State management
14. Очистка неиспользуемого кода

---

## Метрики успеха

| Метрика | До | После |
|---------|-----|-------|
| ESLint ошибки | 346 | 0 |
| ESLint warnings | 119 | <20 |
| Файлы с `any` | 28 | 0 |
| Дублирование кода | ~15% | <5% |
| Покрытие тестами | 0% | >60% |
| Lighthouse Score | ~70 | >90 |
| Build time | ? | -20% |

---

## Команды для проверки

```bash
# Проверка линтинга
npm run lint

# Проверка типов
npx tsc --noEmit

# Сборка
npm run build

# Запуск тестов (после добавления)
npm test

# Аудит безопасности
npm audit
```
