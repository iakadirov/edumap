# Архитектура Header компонентов

## Обзор

Система Header компонентов построена на принципах композиции и переиспользования. Базовая логика вынесена в `BaseHeader`, а раздел-специфичный контент создается через композицию компонентов.

## Архитектура

```
BaseHeader (базовая логика)
    ├── SchoolsHeader (для раздела школ)
    │   ├── SchoolsTopBar
    │   └── SchoolsMainNav
    │
    ├── HomeHeader (для главной страницы) - через общий Header
    │   ├── HomeTopBar
    │   └── HomeMainNav
    │
    └── [Будущие модули]
        ├── KindergartensHeader
        ├── UniversitiesHeader
        └── CoursesHeader
```

## Компоненты

### BaseHeader

**Путь:** `src/components/shared/Header/BaseHeader.tsx`

**Назначение:** Базовая логика для всех Header компонентов

**Функциональность:**
- Sticky позиционирование (fixed)
- Автоматическое скрытие топ бара при скролле
- Уменьшение высоты основной шапки при скролле
- Spacer для предотвращения перекрытия контента

**Props:**
```tsx
interface BaseHeaderProps {
  topBar?: ReactNode;    // Верхняя строка (опционально)
  mainNav: ReactNode;    // Основная навигация (обязательно)
  children?: ReactNode;  // Дополнительный контент
}
```

**Использование:**
```tsx
<BaseHeader
  topBar={<CustomTopBar />}
  mainNav={<CustomMainNav />}
/>
```

### SchoolsHeader

**Путь:** `src/components/schools/Header/SchoolsHeader.tsx`

**Описание:** Header для раздела школ. Использует `SchoolsTopBar` и `SchoolsMainNav`.

**Особенности:**
- "Maktablar" всегда активны в топ баре
- Ссылки ведут на `/schools/*`
- Интегрирован с `RegionProvider`

### Header (общий)

**Путь:** `src/components/shared/Header.tsx`

**Описание:** Header для главной страницы и общих разделов. Использует `HomeTopBar` и `HomeMainNav`.

**Особенности:**
- Определяет активный тип организации динамически
- Используется для главной страницы (`/`), parents, olympiads

## Логика скролла

### Этап 1: Скрытие топ бара (0-68px)

Топ бар скрывается при скролле больше 15px (snap эффект):
- `scrollY < 15px` → топ бар видим
- `scrollY >= 15px` → топ бар скрыт через `transform: translateY(-100%)`

### Этап 2: Уменьшение основной шапки (68px+)

Основная шапка уменьшает padding:
- `scrollY < 68px` → `py-6` (24px сверху и снизу)
- `scrollY >= 68px` → `py-3` (12px сверху и снизу)

### Spacer

Динамически вычисляемая высота для предотвращения перекрытия контента:
- Когда топ бар видим: `topBarHeight + mainHeaderHeight`
- Когда топ бар скрыт: `mainHeaderHeight`

## Создание нового Header

### Шаг 1: Создать TopBar компонент

```tsx
// src/components/{module}/Header/{Module}TopBar.tsx
export function {Module}TopBar() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-3 ...">
      {/* Контент верхней строки */}
    </div>
  );
}
```

### Шаг 2: Создать MainNav компонент

```tsx
// src/components/{module}/Header/{Module}MainNav.tsx
export function {Module}MainNav() {
  return (
    <>
      {/* Логотип и навигация */}
      {/* Поиск и вход */}
    </>
  );
}
```

### Шаг 3: Создать Header компонент

```tsx
// src/components/{module}/Header/{Module}Header.tsx
import { BaseHeader } from '@/components/shared/Header/BaseHeader';
import { {Module}TopBar } from './{Module}TopBar';
import { {Module}MainNav } from './{Module}MainNav';

export function {Module}Header() {
  return (
    <BaseHeader
      topBar={<{Module}TopBar />}
      mainNav={<{Module}MainNav />}
    />
  );
}
```

### Шаг 4: Использовать в layout

```tsx
// src/app/{module}/layout.tsx
import { {Module}Header } from '@/components/{module}/Header/{Module}Header';

export default function {Module}Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <{Module}Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

## Преимущества архитектуры

1. **Переиспользование** - базовая логика в одном месте
2. **Модульность** - каждый раздел имеет свой Header
3. **Гибкость** - легко кастомизировать под раздел
4. **Консистентность** - одинаковое поведение скролла везде
5. **Масштабируемость** - легко добавлять новые модули

## Технические детали

### requestAnimationFrame

Используется для оптимизации обработки скролла и предотвращения лишних перерисовок.

### getBoundingClientRect

Используется для точного измерения высоты топ бара при монтировании.

### CSS Transitions

Плавные переходы через CSS `transition` для лучшей производительности.

## Миграция

Старый `Header.tsx` был рефакторен:
- Логика sticky/scroll → `BaseHeader`
- Контент → `HomeTopBar` + `HomeMainNav`
- Новый `Header.tsx` → композиция `BaseHeader` + `Home*` компоненты

Старые страницы в `(main)/schools/` были мигрированы в `schools/` с новым layout.

