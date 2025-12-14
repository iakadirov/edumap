# Модуль школ (Schools Module)

## Обзор

Модуль школ является первым полностью реализованным разделом платформы EduMap.uz. Он использует новую модульную архитектуру Header компонентов, основанную на `BaseHeader`.

## Структура

### Компоненты Header

```
src/components/schools/Header/
├── SchoolsHeader.tsx      # Главный компонент Header для школ
├── SchoolsTopBar.tsx      # Верхняя строка (навигация по типам организаций)
└── SchoolsMainNav.tsx     # Основная навигация (логотип, ссылки, поиск)
```

### Layout

```
src/app/schools/
├── layout.tsx             # Layout с SchoolsHeader и RegionProvider
├── page.tsx               # Главная страница раздела (/schools)
├── list/
│   └── page.tsx          # Каталог школ (/schools/list)
└── [slug]/
    ├── page.tsx          # Профиль школы (/schools/[slug])
    └── not-found.tsx     # 404 для несуществующих школ
```

## Использование BaseHeader

`SchoolsHeader` использует `BaseHeader` как основу:

```tsx
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

## Особенности

1. **Раздел-специфичная навигация**: В `SchoolsTopBar` "Maktablar" всегда активны для раздела школ
2. **SEO оптимизация**: Метаданные настроены для раздела школ
3. **RegionProvider**: Автоматически подключен для работы с регионами/районами

## Маршруты

- `/schools` - главная страница раздела школ (Hero + преимущества)
- `/schools/list` - каталог всех школ с фильтрами
- `/schools/[slug]` - профиль конкретной школы

## Связь с другими модулями

- Использует общие компоненты: `RegionSelector`, `SchoolCard`, `SchoolFilters`
- Наследует поведение sticky header от `BaseHeader`
- Совместим с общей системой фильтрации и поиска

## Миграция

Модуль был мигрирован из `src/app/(main)/schools/` в `src/app/schools/` для:
- Лучшей SEO (прямые маршруты без групп)
- Модульности (отдельный layout для школ)
- Масштабируемости (легко добавить другие модули)

## Будущие улучшения

- [ ] Оптимизация производительности для большого количества школ
- [ ] Расширенные фильтры
- [ ] Интеграция с картами
- [ ] AI рекомендации

