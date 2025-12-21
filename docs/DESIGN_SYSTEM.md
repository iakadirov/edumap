# Дизайн-система EduMap

Полное техническое описание дизайн-системы для экосистемы проектов EduMap.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Layout System](#layout-system)
3. [Typography](#typography)
4. [Colors](#colors)
5. [Grid & Spacing](#grid--spacing)
6. [Shadows](#shadows)
7. [Border Radius](#border-radius)
8. [Components](#components)
9. [Responsive Breakpoints](#responsive-breakpoints)
10. [Использование в проектах](#использование-в-проектах)

---

## Обзор

**Технологический стек:**
- **CSS Framework**: Tailwind CSS v4
- **UI Library**: shadcn/ui (style: "new-york")
- **PostCSS**: @tailwindcss/postcss
- **Color System**: OKLCH
- **Icons**: Lucide React, Solar Icons
- **Font Loading**: Google Fonts

**Основные принципы:**
- Mobile-first подход
- Семантическая цветовая система
- Трехуровневая контейнерная система
- Единая система отступов и размеров
- Поддержка темной темы (dark mode)

---

## Layout System

### Контейнерная система (3 уровня)

Проект использует трехуровневую контейнерную систему для управления шириной контента:

#### 1. Container Wrapper
**Назначение**: Внешний контейнер, ограничивает максимальную ширину страницы

```css
--container-wrapper: 1200px
--container-wrapper-padding: 30px
```

**Использование:**
```tsx
<div className="container-wrapper py-0">
  {/* Контент */}
</div>
```

**Характеристики:**
- Максимальная ширина: `1200px`
- Горизонтальные отступы: `30px` (с каждой стороны)
- Используется для обертки всего контента страницы

#### 2. Container Content
**Назначение**: Контентный контейнер с фоном и скруглением

```css
--container-content: 1140px  /* 1200 - 30*2 */
--container-content-padding: 24px
```

**Использование:**
```tsx
<div className="container-content">
  {/* Контент с фоном */}
</div>
```

**Характеристики:**
- Максимальная ширина: `1140px`
- Горизонтальные отступы: `24px`
- Вертикальные отступы: `32px` (top), `24px` (bottom)
- Скругление углов: `24px`
- Фон в main секциях: `#f7fcfe` (светло-голубоватый)
- Белый фон на страницах школ

#### 3. Container Inner
**Назначение**: Внутренний контейнер для точного контроля ширины

```css
--container-inner: 1092px  /* 1140 - 24*2 */
```

**Использование:**
```tsx
<div className="container-inner">
  {/* Внутренний контент без дополнительных отступов */}
</div>
```

**Характеристики:**
- Максимальная ширина: `1092px`
- Без внутренних отступов
- Используется для точного позиционирования контента

### Структура Layout

```tsx
<div className="flex min-h-screen flex-col">
  <Header />
  <main className="flex-1">
    <div className="container-wrapper py-0">
      <div className="container-content">
        <div className="container-inner">
          {/* Контент */}
        </div>
      </div>
    </div>
  </main>
  <Footer />
</div>
```

---

## Typography

### Шрифты

#### Основной шрифт (Sans)
```css
--font-sans: "Google Sans Flex", system-ui, -apple-system, sans-serif
```

**Google Sans Flex:**
- Источник: Google Fonts
- Загрузка: `https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap`
- Оптический размер: 6-144
- Вес: 1-1000 (variable font)
- Fallback: system-ui, -apple-system, sans-serif

#### Моноширинный шрифт (Mono)
```css
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
```

### Типографическая шкала

#### Заголовки

**H1**
```css
text-4xl font-bold tracking-tight lg:text-5xl
scroll-m-20
```
- Mobile: `2.25rem` (36px)
- Desktop: `3rem` (48px)
- Вес: `bold` (700)
- Tracking: `tight`

**H2**
```css
text-3xl font-semibold tracking-tight
scroll-m-20 border-b pb-2 first:mt-0
```
- Размер: `1.875rem` (30px)
- Вес: `semibold` (600)
- Нижняя граница с отступом

**H3**
```css
text-2xl font-semibold tracking-tight
scroll-m-20
```
- Размер: `1.5rem` (24px)
- Вес: `semibold` (600)

**H4**
```css
text-xl font-semibold tracking-tight
scroll-m-20
```
- Размер: `1.25rem` (20px)
- Вес: `semibold` (600)

#### Параграфы
```css
leading-7 [&:not(:first-child)]:mt-6
```
- Line height: `1.75rem` (28px)
- Отступ сверху: `1.5rem` (24px) для всех кроме первого

#### Код
```css
rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold
```

### Font Features
```css
font-feature-settings: "rlig" 1, "calt" 1
```
- `rlig`: Required ligatures
- `calt`: Contextual alternates

### Text Utilities

**Text Balance**
```css
.text-balance {
  text-wrap: balance;
}
```
Используется для равномерного распределения текста в заголовках.

---

## Colors

### Цветовая система: OKLCH

Проект использует современную цветовую систему **OKLCH** для лучшей предсказуемости и консистентности цветов.

### Light Theme (Светлая тема)

#### Основные цвета

**Background (Фон)**
```css
--background: oklch(0.98 0.005 240)
```
- Светло-голубоватый фон страницы
- L: 98%, C: 0.005, H: 240° (голубой оттенок)

**Foreground (Текст)**
```css
--foreground: oklch(0.15 0.01 240)
```
- Основной цвет текста
- L: 15%, C: 0.01, H: 240°

**Card (Карточки)**
```css
--card: oklch(1 0 0)
--card-foreground: oklch(0.15 0.01 240)
```
- Белые карточки с темным текстом

#### Primary (Основной цвет)

**Образовательный синий**
```css
--primary: oklch(0.55 0.2 264)
--primary-foreground: oklch(0.985 0 0)
```
- L: 55%, C: 0.2, H: 264° (синий)
- Используется для кнопок, ссылок, акцентов

#### Secondary (Вторичный)

```css
--secondary: oklch(0.96 0.01 240)
--secondary-foreground: oklch(0.25 0.01 240)
```
- Светло-голубоватый фон
- L: 96%, C: 0.01, H: 240°

#### Muted (Приглушенный)

```css
--muted: oklch(0.95 0.01 240)
--muted-foreground: oklch(0.5 0.01 240)
```
- Голубовато-серый для второстепенного контента
- L: 95%, C: 0.01, H: 240°

#### Accent (Акцент)

```css
--accent: oklch(0.95 0.015 240)
--accent-foreground: oklch(0.55 0.2 264)
```
- Для hover состояний и акцентов

#### Destructive (Деструктивный)

```css
--destructive: oklch(0.577 0.245 27.325)
```
- Красный для удаления и ошибок
- L: 57.7%, C: 0.245, H: 27.325° (красный)

#### Border & Input

```css
--border: oklch(0.9 0.01 240)
--input: oklch(0.95 0.01 240)
--ring: oklch(0.55 0.2 264)
```
- Границы: L: 90%
- Поля ввода: L: 95%
- Фокус: Primary цвет

#### Chart Colors (Цвета для графиков)

```css
--chart-1: oklch(0.646 0.222 41.116)  /* Оранжевый */
--chart-2: oklch(0.6 0.118 184.704)   /* Голубой */
--chart-3: oklch(0.398 0.07 227.392)  /* Синий */
--chart-4: oklch(0.828 0.189 84.429)  /* Желтый */
--chart-5: oklch(0.769 0.188 70.08)   /* Желто-зеленый */
```

### Dark Theme (Темная тема)

#### Основные цвета

```css
--background: oklch(0.145 0 0)           /* Темный фон */
--foreground: oklch(0.985 0 0)           /* Светлый текст */
--card: oklch(0.205 0 0)                 /* Темные карточки */
--card-foreground: oklch(0.985 0 0)      /* Светлый текст */
```

#### Primary (Темная тема)

```css
--primary: oklch(0.922 0 0)
--primary-foreground: oklch(0.205 0 0)
```

#### Secondary (Темная тема)

```css
--secondary: oklch(0.269 0 0)
--secondary-foreground: oklch(0.985 0 0)
```

#### Destructive (Темная тема)

```css
--destructive: oklch(0.704 0.191 22.216)
```

#### Border & Input (Темная тема)

```css
--border: oklch(1 0 0 / 10%)
--input: oklch(1 0 0 / 15%)
--ring: oklch(0.556 0 0)
```

### Sidebar Colors (Цвета боковой панели)

#### Light Theme
```css
--sidebar: oklch(0.985 0 0)              /* Белый */
--sidebar-foreground: oklch(0.145 0 0)   /* Темный текст */
--sidebar-primary: oklch(0.205 0 0)      /* Темный акцент */
--sidebar-accent: oklch(0.97 0 0)         /* Светлый акцент */
--sidebar-border: oklch(0.922 0 0)        /* Светлая граница */
```

#### Dark Theme
```css
--sidebar: oklch(0.205 0 0)              /* Темный */
--sidebar-foreground: oklch(0.985 0 0)   /* Светлый текст */
--sidebar-primary: oklch(0.55 0.2 264)   /* Синий акцент */
--sidebar-accent: oklch(0.269 0 0)       /* Темный акцент */
--sidebar-border: oklch(1 0 0 / 10%)     /* Полупрозрачная граница */
```

### Использование цветов в коде

```tsx
// Tailwind классы
className="bg-primary text-primary-foreground"
className="bg-card text-card-foreground"
className="border-border"
className="text-muted-foreground"

// CSS переменные
style={{ backgroundColor: 'var(--primary)' }}
```

---

## Grid & Spacing

### Spacing Scale (Шкала отступов)

Проект использует стандартную шкалу Tailwind CSS:

| Класс | Значение | Пиксели |
|-------|----------|---------|
| `gap-0` | 0 | 0px |
| `gap-1` | 0.25rem | 4px |
| `gap-1.5` | 0.375rem | 6px |
| `gap-2` | 0.5rem | 8px |
| `gap-3` | 0.75rem | 12px |
| `gap-4` | 1rem | 16px |
| `gap-6` | 1.5rem | 24px |
| `gap-8` | 2rem | 32px |

### Grid System

#### Базовый Grid

```tsx
// 2 колонки на средних экранах, 4 на больших
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {/* Элементы */}
</div>
```

#### Flexbox Spacing

```tsx
// Горизонтальное расположение с отступами
<div className="flex items-center gap-2">
  {/* Элементы */}
</div>

// Вертикальное расположение
<div className="flex flex-col gap-4">
  {/* Элементы */}
</div>
```

#### Space Utilities

```tsx
// Вертикальные отступы между дочерними элементами
<div className="space-y-4">
  <div>Элемент 1</div>
  <div>Элемент 2</div>
</div>

// Горизонтальные отступы
<div className="space-x-2">
  <span>Элемент 1</span>
  <span>Элемент 2</span>
</div>
```

### Responsive Grid Patterns

```tsx
// Mobile-first: 1 колонка → 2 колонки → 4 колонки
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Карточки */}
</div>

// Адаптивные отступы
<div className="gap-2 sm:gap-4 lg:gap-6">
  {/* Контент */}
</div>
```

### Container Queries (для Card компонентов)

```tsx
// Grid с container queries
<div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2">
  {/* Адаптивный контент внутри карточки */}
</div>
```

---

## Shadows

### Bento Card Shadows

Система теней для карточек в стиле "bento":

```css
--shadow-0: 0 0 0 0 rgba(0, 0, 0, 0)
--shadow-1: 0 1px 2px 0 rgba(0, 0, 0, 0.01)
--shadow-2: 0 1px 3px 0 rgba(0, 0, 0, 0.02)
--shadow-5: 0 4px 6px -1px rgba(0, 0, 0, 0.05)
```

### Использование

```tsx
// Классы для теней
className="bento-shadow-0"  // Без тени
className="bento-shadow-1"  // Минимальная тень
className="bento-shadow-2"  // Легкая тень
className="bento-shadow-5"  // Средняя тень

// Hover эффект на карточках
className="hover:bento-shadow-5"
```

### Tailwind Shadow Utilities

Также доступны стандартные тени Tailwind:
- `shadow-xs` - Минимальная тень
- `shadow-sm` - Малая тень
- `shadow` - Базовая тень
- `shadow-md` - Средняя тень
- `shadow-lg` - Большая тень

---

## Border Radius

### Радиусы скругления

Базовая система радиусов основана на переменной `--radius`:

```css
--radius: 0.625rem  /* 10px - базовый радиус */
```

### Производные радиусы

```css
--radius-sm: calc(var(--radius) - 4px)   /* 6px */
--radius-md: calc(var(--radius) - 2px)   /* 8px */
--radius-lg: var(--radius)               /* 10px */
--radius-xl: calc(var(--radius) + 4px)   /* 14px */
```

### Использование в компонентах

#### Кнопки
```tsx
// Разные размеры кнопок
className="rounded-md"  // 8px (sm, lg размеры)
className="rounded-md"  // 8px (default размер)
```

#### Карточки
```tsx
// Карточки используют xl радиус
className="rounded-xl"  // 14px
```

#### Container Content
```css
border-radius: 24px  /* Фиксированный для контейнеров */
```

### Tailwind Radius Classes

| Класс | Значение |
|-------|----------|
| `rounded-none` | 0 |
| `rounded-sm` | 0.125rem (2px) |
| `rounded` | 0.25rem (4px) |
| `rounded-md` | 0.375rem (6px) |
| `rounded-lg` | 0.5rem (8px) |
| `rounded-xl` | 0.75rem (12px) |
| `rounded-2xl` | 1rem (16px) |
| `rounded-3xl` | 1.5rem (24px) |

---

## Components

### UI Component Library: shadcn/ui

Проект использует **shadcn/ui** с темой **"new-york"**.

#### Доступные компоненты

- `Avatar` - Аватары пользователей
- `Badge` - Бейджи и метки
- `Button` - Кнопки (7 вариантов)
- `Card` - Карточки контента
- `Checkbox` - Чекбоксы
- `Dialog` - Модальные окна
- `Dropdown Menu` - Выпадающие меню
- `Input` - Поля ввода
- `Label` - Метки полей
- `Navigation Menu` - Навигационные меню
- `Phone Input` - Поля для телефонов
- `Progress` - Индикаторы прогресса
- `Radio Group` - Радио-кнопки
- `Select` - Выпадающие списки
- `Separator` - Разделители
- `Slider` - Слайдеры
- `Switch` - Переключатели
- `Table` - Таблицы
- `Tabs` - Вкладки
- `Textarea` - Многострочные поля
- `Tooltip` - Всплывающие подсказки

### Button Variants

```tsx
<Button variant="default">Основная</Button>
<Button variant="destructive">Удалить</Button>
<Button variant="outline">Контур</Button>
<Button variant="secondary">Вторичная</Button>
<Button variant="ghost">Призрачная</Button>
<Button variant="link">Ссылка</Button>
```

### Button Sizes

```tsx
<Button size="sm">Маленькая</Button>
<Button size="default">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon">Иконка</Button>
```

### Card Structure

```tsx
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
    <CardAction>
      {/* Действие */}
    </CardAction>
  </CardHeader>
  <CardContent>
    {/* Контент */}
  </CardContent>
  <CardFooter>
    {/* Футер */}
  </CardFooter>
</Card>
```

---

## Responsive Breakpoints

### Tailwind Breakpoints

| Префикс | Минимальная ширина | Описание |
|---------|-------------------|----------|
| `sm:` | 640px | Планшеты (портрет) |
| `md:` | 768px | Планшеты (альбом) |
| `lg:` | 1024px | Ноутбуки |
| `xl:` | 1280px | Десктопы |
| `2xl:` | 1536px | Большие экраны |

### Mobile-First Approach

Все стили пишутся для мобильных устройств по умолчанию, затем добавляются медиа-запросы для больших экранов:

```tsx
// Мобильный: 1 колонка, Desktop: 2 колонки
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Контент */}
</div>

// Мобильный: вертикально, Desktop: горизонтально
<div className="flex flex-col lg:flex-row gap-4">
  {/* Контент */}
</div>
```

### Примеры адаптивных паттернов

```tsx
// Адаптивные размеры текста
<h1 className="text-4xl sm:text-5xl lg:text-6xl">
  Заголовок
</h1>

// Адаптивные отступы
<div className="p-4 sm:p-6 lg:p-8">
  Контент
</div>

// Адаптивные grid колонки
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  Карточки
</div>
```

---

## Использование в проектах

### Настройка нового проекта

#### 1. Установка зависимостей

```json
{
  "dependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "tw-animate-css": "^1.4.0",
    "lucide-react": "^0.560.0"
  }
}
```

#### 2. Копирование globals.css

Скопировать файл `src/app/globals.css` со всеми CSS переменными и стилями.

#### 3. Настройка PostCSS

```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

#### 4. Настройка layout.tsx

```tsx
// Добавить загрузку Google Sans Flex
<link
  href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
  rel="stylesheet"
/>
```

#### 5. Настройка components.json (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide"
}
```

### Проверка соответствия

#### Чеклист для новых проектов

- [ ] Используется Tailwind CSS v4
- [ ] Скопирован `globals.css` с полной конфигурацией
- [ ] Настроена загрузка Google Sans Flex
- [ ] Используется контейнерная система (wrapper → content → inner)
- [ ] Цвета определены через CSS переменные в OKLCH
- [ ] Компоненты shadcn/ui используют тему "new-york"
- [ ] Соблюдена шкала отступов Tailwind
- [ ] Используются bento shadows для карточек
- [ ] Радиусы скругления соответствуют системе
- [ ] Mobile-first подход в responsive дизайне

### Общие паттерны

#### Структура страницы

```tsx
export default function Page() {
  return (
    <div className="container-wrapper py-0">
      <div className="container-content">
        <div className="container-inner">
          <h1>Заголовок</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Контент */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Карточки

```tsx
<Card className="hover:bento-shadow-5">
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>
    Контент
  </CardContent>
</Card>
```

#### Кнопки

```tsx
<div className="flex gap-4">
  <Button variant="default" size="lg">
    Основная
  </Button>
  <Button variant="outline" size="lg">
    Вторичная
  </Button>
</div>
```

---

## Дополнительные утилиты

### Scrollbar Styling

```css
/* Тонкий скроллбар для админ-панели */
scrollbar-width: thin;
scrollbar-color: var(--border) transparent;
```

### Text Utilities

```tsx
// Обрезка текста до 3 строк
<div className="line-clamp-3">
  Длинный текст...
</div>

// Скрытие скроллбара
<div className="scrollbar-hide">
  Контент со скроллом
</div>
```

### Focus States

Все интерактивные элементы имеют единый стиль фокуса:

```css
outline-ring/50
focus-visible:ring-ring/50
focus-visible:ring-[3px]
```

---

## Версионирование

**Текущая версия дизайн-системы**: 1.0.0

**Последнее обновление**: 2025-01-XX

**Совместимость:**
- Tailwind CSS: ^4.0.0
- Next.js: ^16.0.0
- React: ^19.0.0

---

## Контакты и поддержка

При изменении дизайн-системы необходимо:
1. Обновить этот документ
2. Уведомить команду о breaking changes
3. Обновить все проекты экосистемы синхронно

---

**Примечание**: Этот документ является живым документом и должен обновляться при любых изменениях в дизайн-системе.

