# План нормализации административно-территориального деления

## Понимание структуры

### Уровни административно-территориального деления Узбекистана:

**1-й уровень (14 единиц):**
- 12 областей (вилоятов)
- 1 республика (Каракалпакстан)
- 1 город центрального подчинения (Ташкент)

**2-й уровень:**
- Районы (туманы) в областях/республике
- Города областного (республиканского) подчинения
- Внутригородские районы (для Ташкента)

**3-й уровень (опционально, для будущего):**
- Города районного подчинения
- Городские посёлки (шаҳарча)
- Сельские сходы граждан (қишлоқ фуқаролар йиғини)

---

## План реализации (долгосрочное решение)

### Этап 1: Создание справочных таблиц

#### 1.1 Таблица `regions` (1-й уровень)

```sql
CREATE TABLE regions (
  id INTEGER PRIMARY KEY,                    -- ID из репозитория
  soato_id INTEGER UNIQUE NOT NULL,          -- SOATO код (стандарт Узбекистана)
  name_uz TEXT NOT NULL,                     -- Название на узбекском (латиница)
  name_oz TEXT,                              -- Название на узбекском (кириллица)
  name_ru TEXT NOT NULL,                     -- Название на русском
  region_type TEXT NOT NULL CHECK (           -- Тип: область, республика, город
    region_type IN ('viloyat', 'respublika', 'shahar')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_regions_soato ON regions(soato_id);
CREATE INDEX idx_regions_type ON regions(region_type);
COMMENT ON TABLE regions IS 'Области, республика и город центрального подчинения (1-й уровень АТД)';
```

**Данные:** 14 записей из `regions.json`

#### 1.2 Таблица `districts` (2-й уровень)

```sql
CREATE TABLE districts (
  id INTEGER PRIMARY KEY,                    -- ID из репозитория
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  soato_id INTEGER UNIQUE NOT NULL,          -- SOATO код
  name_uz TEXT NOT NULL,                     -- Название на узбекском (латиница)
  name_oz TEXT,                              -- Название на узбекском (кириллица)
  name_ru TEXT NOT NULL,                     -- Название на русском
  district_type TEXT NOT NULL CHECK (        -- Тип: район, город областного подчинения
    district_type IN ('tuman', 'shahar')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_districts_region ON districts(region_id);
CREATE INDEX idx_districts_soato ON districts(soato_id);
CREATE INDEX idx_districts_type ON districts(district_type);
COMMENT ON TABLE districts IS 'Районы и города областного подчинения (2-й уровень АТД)';
```

**Данные:** ~2641 записей из `districts.json`

#### 1.3 Обновление таблицы `organizations`

```sql
-- Добавляем связи с нормализованными таблицами
ALTER TABLE organizations
  ADD COLUMN region_id INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  ADD COLUMN district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL;

-- Индексы для быстрого поиска
CREATE INDEX idx_organizations_region_id ON organizations(region_id);
CREATE INDEX idx_organizations_district_id ON organizations(district_id);

-- Комментарии
COMMENT ON COLUMN organizations.region_id IS 'Ссылка на нормализованную таблицу regions (приоритет над region)';
COMMENT ON COLUMN organizations.district_id IS 'Ссылка на нормализованную таблицу districts (приоритет над district)';

-- Старые поля оставляем для обратной совместимости (можно будет удалить позже)
COMMENT ON COLUMN organizations.region IS 'Устаревшее поле (deprecated), используйте region_id';
COMMENT ON COLUMN organizations.district IS 'Устаревшее поле (deprecated), используйте district_id';
```

---

### Этап 2: Загрузка данных

#### 2.1 Загрузка областей (regions)

```sql
-- Вставка данных из regions.json
-- Используем id и soato_id из репозитория
INSERT INTO regions (id, soato_id, name_uz, name_oz, name_ru, region_type)
VALUES
  (2, 1703, 'Andijon viloyati', 'Андижон вилояти', 'Андижанская область', 'viloyat'),
  (3, 1706, 'Buxoro viloyati', 'Бухоро вилояти', 'Бухарская область', 'viloyat'),
  -- ... все 14 записей
  (11, 1726, 'Toshkent shahri', 'Тошкент шаҳри', 'город Ташкент', 'shahar'),
  (15, 1735, 'Qoraqalpog''iston Respublikasi', 'Қорақалпоғистон Республикаси', 'Республика Каракалпакстан', 'respublika');
```

#### 2.2 Загрузка районов (districts)

```sql
-- Вставка данных из districts.json
INSERT INTO districts (id, region_id, soato_id, name_uz, name_oz, name_ru, district_type)
SELECT 
  id,
  region_id,
  soato_id,
  name_uz,
  name_oz,
  name_ru,
  CASE 
    WHEN name_uz LIKE '%shahri%' OR name_uz NOT LIKE '%tumani%' THEN 'shahar'
    ELSE 'tuman'
  END as district_type
FROM -- данные из JSON
```

---

### Этап 3: Миграция существующих данных

#### 3.1 Маппинг текстовых значений к ID

```sql
-- Функция для поиска region_id по текстовому названию
CREATE OR REPLACE FUNCTION find_region_id(region_name TEXT)
RETURNS INTEGER AS $$
  SELECT id FROM regions 
  WHERE name_uz ILIKE '%' || region_name || '%'
     OR name_ru ILIKE '%' || region_name || '%'
     OR name_oz ILIKE '%' || region_name || '%'
  LIMIT 1;
$$ LANGUAGE sql;

-- Функция для поиска district_id по текстовому названию
CREATE OR REPLACE FUNCTION find_district_id(district_name TEXT, org_region_id INTEGER)
RETURNS INTEGER AS $$
  SELECT id FROM districts 
  WHERE region_id = COALESCE(org_region_id, 0) OR org_region_id IS NULL
    AND (
      name_uz ILIKE '%' || district_name || '%'
      OR name_ru ILIKE '%' || district_name || '%'
      OR name_oz ILIKE '%' || district_name || '%'
    )
  LIMIT 1;
$$ LANGUAGE sql;
```

#### 3.2 Заполнение region_id

```sql
-- Заполняем region_id на основе city и district
UPDATE organizations o
SET region_id = CASE
  -- Ташкент
  WHEN o.city = 'Ташкент' THEN (SELECT id FROM regions WHERE name_uz = 'Toshkent shahri')
  -- Андижан
  WHEN o.city = 'Андижан' THEN (SELECT id FROM regions WHERE name_uz = 'Andijon viloyati')
  -- Наманган
  WHEN o.city = 'Наманган' THEN (SELECT id FROM regions WHERE name_uz = 'Namangan viloyati')
  -- Добавить другие города
  ELSE find_region_id(COALESCE(o.region, o.city))
END
WHERE region_id IS NULL;
```

#### 3.3 Заполнение district_id

```sql
-- Заполняем district_id на основе district
UPDATE organizations o
SET district_id = find_district_id(
  o.district,
  o.region_id
)
WHERE district_id IS NULL
  AND o.district IS NOT NULL;
```

---

### Этап 4: Обновление запросов

#### 4.1 Обновить `getDistrictsWithCounts()`

```typescript
export async function getDistrictsWithCounts(regionId?: number) {
  const supabase = await createClient();
  
  let query = supabase
    .from('districts')
    .select(`
      id,
      name_uz,
      name_ru,
      region_id,
      districts_count:organizations!district_id(count)
    `, { count: 'exact' })
    .eq('org_type', 'school')
    .eq('status', 'active');

  // Фильтруем по области, если выбрана
  if (regionId) {
    query = query.eq('region_id', regionId);
  }

  const { data, error } = await query;

  // ...
}
```

#### 4.2 Обновить `getSchoolsWithFilters()`

```typescript
// Использовать district_id вместо district
if (filters.districts && filters.districts.length > 0) {
  query = query.in('district_id', filters.districts);
}

// Фильтр по области
if (filters.region) {
  query = query.eq('region_id', filters.region);
}
```

---

### Этап 5: Обратная совместимость (временная)

```sql
-- Триггеры для автоматического заполнения старых полей (deprecated)
CREATE OR REPLACE FUNCTION sync_region_text()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.region_id IS NOT NULL AND (NEW.region IS NULL OR NEW.region = '') THEN
    SELECT name_uz INTO NEW.region FROM regions WHERE id = NEW.region_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_region_text_trigger
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION sync_region_text();
```

---

## Преимущества этого подхода

✅ **Нормализация данных:**
- Нет дублирования названий
- Гарантированная целостность через внешние ключи
- Легко обновлять названия в одном месте

✅ **Производительность:**
- Индексы на ID быстрее, чем текстовый поиск
- JOIN быстрее, чем LIKE поиск

✅ **Масштабируемость:**
- Легко добавить 3-й уровень (settlements)
- Легко добавить дополнительные поля (координаты, статистика)

✅ **Соответствие стандартам:**
- SOATO коды для интеграции с гос. системами
- Поддержка многоязычности

✅ **Типизация:**
- region_type и district_type для фильтрации
- Разделение городов и районов

---

## Миграционный путь

1. ✅ Создать таблицы regions и districts
2. ✅ Загрузить данные из репозитория
3. ✅ Добавить region_id и district_id в organizations
4. ✅ Мигрировать существующие данные
5. ✅ Обновить запросы для использования ID
6. ✅ Обновить фронтенд компоненты
7. ⏳ Удалить старые текстовые поля (через месяц после проверки)

---

## Риски и митигация

| Риск | Митигация |
|------|-----------|
| Потеря данных при миграции | Оставить старые поля как backup, мигрировать постепенно |
| Несоответствие названий | Функции маппинга с LIKE поиском, ручная проверка |
| Производительность JOIN | Индексы на всех ключах, партиционирование при росте |

---

## Временная оценка

- Этап 1 (создание таблиц): 1-2 часа
- Этап 2 (загрузка данных): 1 час
- Этап 3 (миграция данных): 2-3 часа
- Этап 4 (обновление запросов): 2-3 часа
- Этап 5 (обратная совместимость): 1 час

**Итого: 7-10 часов работы**

