# Архитектура для масштабирования проекта

## Проблема текущей архитектуры

Текущая структура использует один общий layout `(main)/layout.tsx` с одним Header компонентом, который пытается адаптироваться для всех разделов через `pathname`. Это создает проблемы:

1. **Header становится монолитным** - все логика для всех разделов в одном компоненте
2. **Трудно поддерживать** - изменения для одного раздела могут сломать другой
3. **Нет изоляции** - каждый раздел не может иметь свою специфичную логику
4. **Сложно тестировать** - все связано вместе

## Рекомендуемая архитектура

### Структура папок

```
src/app/
├── layout.tsx                    ← Корневой layout (метаданные, шрифты, провайдеры)
├── page.tsx                      ← Главная edumap.uz (/)
│
├── schools/
│   ├── layout.tsx                ← Layout для школ (свой Header, своя навигация)
│   ├── page.tsx                  ← /schools (главная школ)
│   ├── list/
│   │   └── page.tsx              ← /schools/list (каталог с фильтрами)
│   ├── [slug]/
│   │   └── page.tsx              ← /schools/cambridge-school
│   ├── compare/
│   │   └── page.tsx              ← /schools/compare
│   └── ai-match/
│       └── page.tsx              ← /schools/ai-match
│
├── kindergartens/
│   ├── layout.tsx                ← Layout для садиков (свой Header, своя навигация)
│   ├── page.tsx                  ← /kindergartens
│   ├── list/
│   │   └── page.tsx              ← /kindergartens/list
│   └── [slug]/
│       └── page.tsx
│
├── universities/
│   ├── layout.tsx                ← Layout для ВУЗов (свой Header, своя навигация)
│   ├── page.tsx                  ← /universities
│   ├── list/
│   │   └── page.tsx              ← /universities/list
│   └── [slug]/
│       └── page.tsx
│
└── courses/
    ├── layout.tsx                ← Layout для курсов (свой Header, своя навигация)
    ├── page.tsx                  ← /courses
    ├── list/
    │   └── page.tsx              ← /courses/list
    └── [slug]/
        └── page.tsx
```

### Структура компонентов

```
src/components/
├── shared/
│   ├── Header/
│   │   ├── BaseHeader.tsx        ← Базовая логика (sticky, скролл, топ бар)
│   │   ├── HeaderContent.tsx     ← Контент header (логотип, кнопки)
│   │   ├── TopBar.tsx            ← Верхняя строка (выбор города, типы организаций)
│   │   └── MainNav.tsx           ← Основная навигация (меню)
│   │
│   ├── Footer.tsx                ← Общий footer
│   └── Layout.tsx                ← Базовый layout (опционально, для главной)
│
├── schools/
│   ├── SchoolsHeader.tsx         ← Header для школ (использует BaseHeader)
│   ├── SchoolsFilters.tsx        ← Фильтры для школ (уже есть)
│   ├── SchoolsList.tsx           ← Список школ
│   └── ...
│
├── kindergartens/
│   ├── KindergartensHeader.tsx   ← Header для садиков
│   ├── KindergartensFilters.tsx  ← Фильтры для садиков
│   └── ...
│
├── universities/
│   ├── UniversitiesHeader.tsx    ← Header для ВУЗов
│   ├── UniversitiesFilters.tsx   ← Фильтры для ВУЗов
│   └── ...
│
└── courses/
    ├── CoursesHeader.tsx         ← Header для курсов
    ├── CoursesFilters.tsx        ← Фильтры для курсов
    └── ...
```

## Преимущества этой архитектуры

### 1. Изоляция разделов
- Каждый раздел имеет свой layout и свои компоненты
- Изменения в одном разделе не влияют на другие
- Легко удалить или временно отключить раздел

### 2. Переиспользование кода
- `BaseHeader` содержит общую логику (sticky, скролл)
- Каждый раздел-специфичный Header композирует базовый
- Общие компоненты (Footer) используются везде

### 3. Масштабируемость
- Легко добавить новый раздел (просто создать папку)
- Каждый раздел может иметь свои фильтры, карточки, логику
- Можно добавлять раздел-специфичные провайдеры и контексты

### 4. Поддерживаемость
- Четкое разделение ответственности
- Легко найти код конкретного раздела
- Меньше конфликтов при работе в команде

## Пример реализации

### BaseHeader (базовая логика)

```tsx
// src/components/shared/Header/BaseHeader.tsx
'use client';

interface BaseHeaderProps {
  topBar?: React.ReactNode;        // Верхняя строка (кастомная для каждого раздела)
  mainNav?: React.ReactNode;       // Основная навигация (кастомная)
  children?: React.ReactNode;      // Дополнительный контент
}

export function BaseHeader({ topBar, mainNav, children }: BaseHeaderProps) {
  // Вся логика sticky, скролла, топ бара
  // ...
  
  return (
    <header>
      {topBar}
      {mainNav}
      {children}
    </header>
  );
}
```

### SchoolsHeader (конкретная реализация)

```tsx
// src/components/schools/SchoolsHeader.tsx
'use client';

import { BaseHeader } from '@/components/shared/Header/BaseHeader';
import { SchoolsTopBar } from './SchoolsTopBar';
import { SchoolsMainNav } from './SchoolsMainNav';

export function SchoolsHeader() {
  return (
    <BaseHeader
      topBar={<SchoolsTopBar />}
      mainNav={<SchoolsMainNav />}
    />
  );
}
```

### Layout для школ

```tsx
// src/app/schools/layout.tsx
import { SchoolsHeader } from '@/components/schools/SchoolsHeader';
import { Footer } from '@/components/shared/Footer';
import { RegionProvider } from '@/contexts/RegionContext';

export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegionProvider>
      <div className="flex min-h-screen flex-col">
        <SchoolsHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </RegionProvider>
  );
}
```

## Миграция

### Этап 1: Создать базовые компоненты
1. Создать `BaseHeader` с общей логикой
2. Вынести sticky/scroll логику в BaseHeader

### Этап 2: Создать раздел-специфичные Headers
1. Создать `SchoolsHeader` на основе BaseHeader
2. Адаптировать текущий Header для школ

### Этап 3: Создать layouts для разделов
1. Создать `src/app/schools/layout.tsx`
2. Переместить `schools/page.tsx` и `schools/list/`
3. Протестировать

### Этап 4: Рефакторинг других разделов
1. Повторить для kindergartens, universities, courses
2. Удалить общий `(main)/layout.tsx` (или оставить для главной страницы)

## Важные моменты

1. **Главная страница** (`/`) может использовать общий Layout или свой
2. **Общие провайдеры** (RegionProvider) лучше вынести в корневой layout
3. **Footer** остается общим для всех разделов
4. **Метаданные** (SEO) лучше определять в каждом layout

## Выводы

Эта архитектура позволит:
- ✅ Легко добавлять новые разделы
- ✅ Каждый раздел независим
- ✅ Переиспользование кода через композицию
- ✅ Проще поддерживать и расширять
- ✅ Меньше рисков при изменениях

