# Модуль: Школы (Schools)

## Описание
Каталог частных школ Узбекистана с рейтингами, отзывами и AI-подбором.

---

## Функциональность

### MVP (Фаза 1)
- [ ] Каталог школ с фильтрами
- [ ] Страница профиля школы
- [ ] Базовый поиск
- [ ] Сравнение школ (до 3)

### Фаза 2
- [ ] Система отзывов
- [ ] Рейтинги
- [ ] Личный кабинет школы

### Фаза 3
- [ ] AI-подбор школы
- [ ] Верификация отзывов
- [ ] Расширенная аналитика

---

## Структура данных

### Таблица: organizations (общая)
```sql
- id, org_type, name, slug
- description, logo_url
- phone, email, website
- address, district, city, lat, lng
- status, is_verified
- overall_rating, reviews_count
```

### Таблица: school_details (специфичная)
```sql
- school_type (private, state, international)
- accepts_preparatory (BOOLEAN) - принимает ли 0 класс
- grade_from, grade_to (1-11) - классы для приёма
- total_students, avg_class_size
- primary_language, additional_languages
- curriculum (national, cambridge, ib)
- fee_monthly_min, fee_monthly_max
- has_transport, has_meals, has_extended_day
```

### Филиалы школ
- `organizations.parent_organization_id` - ссылка на главную школу
- Филиалы имеют общий бренд/логотип, но независимые данные
- Функции: `getSchoolBranches()`, `getSchoolWithBranches()`

---

## Компоненты UI

```
components/schools/
├── SchoolCard.tsx        # Карточка в списке
├── SchoolFilters.tsx     # Панель фильтров
├── SchoolList.tsx        # Список с пагинацией
├── SchoolProfile.tsx     # Полный профиль
├── SchoolGallery.tsx     # Галерея фото
├── SchoolComparison.tsx  # Таблица сравнения
└── SchoolMap.tsx         # Карта с метками
```

---

## Страницы

```
app/(main)/schools/
├── page.tsx              # /schools — список
├── [slug]/page.tsx       # /schools/intellect — профиль
├── compare/page.tsx      # /schools/compare?ids=1,2,3
└── ai-match/page.tsx     # /schools/ai-match — подбор
```

---

## API Endpoints

```
GET  /api/schools              # Список с фильтрами
GET  /api/schools/[slug]       # Одна школа
GET  /api/schools/compare      # Сравнение
POST /api/schools/ai-match     # AI подбор
```

---

## Фильтры

| Фильтр | Тип | Значения |
|--------|-----|----------|
| district | multi-select | Районы Ташкента |
| price_min | number | от 0 |
| price_max | number | до ∞ |
| language | select | uzbek, russian, english |
| curriculum | multi-select | national, cambridge, ib |
| grades | range | 1-11 |
| has_transport | boolean | |
| has_meals | boolean | |

---

## Связанные документы

- [RATING.md](./RATING.md) — Алгоритм рейтинга
- [MATCHING.md](./MATCHING.md) — Алгоритм AI-подбора

---

*Последнее обновление: Декабрь 2024*
