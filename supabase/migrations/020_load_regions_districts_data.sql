-- Миграция: Загрузка данных в таблицы regions и districts
-- Дата: 2025-12-26
-- Описание: Загрузка данных из репозитория uzbekistan-regions-data
--           Внимание: Этот SQL сгенерирован из JSON файлов
--           Данные должны быть вставлены вручную или через скрипт

-- ============================================================================
-- ЗАГРУЗКА REGIONS (14 записей)
-- ============================================================================

INSERT INTO regions (id, soato_id, name_uz, name_oz, name_ru, region_type) VALUES
  (2, 1703, 'Andijon viloyati', 'Андижон вилояти', 'Андижанская область', 'viloyat'),
  (3, 1706, 'Buxoro viloyati', 'Бухоро вилояти', 'Бухарская область', 'viloyat'),
  (4, 1708, 'Jizzax viloyati', 'Жиззах вилояти', 'Джизакская область', 'viloyat'),
  (5, 1710, 'Qashqadaryo viloyati', 'Қашқадарё вилояти', 'Кашкадарьинская область', 'viloyat'),
  (6, 1712, 'Navoiy viloyati', 'Навоий вилояти', 'Навоийская область', 'viloyat'),
  (7, 1714, 'Namangan viloyati', 'Наманган вилояти', 'Наманганская область', 'viloyat'),
  (8, 1718, 'Samarqand viloyati', 'Самарқанд вилояти', 'Самаркандская область', 'viloyat'),
  (10, 1724, 'Sirdaryo viloyati', 'Сирдарё вилояти', 'Сырдарьинская область', 'viloyat'),
  (11, 1726, 'Toshkent shahri', 'Тошкент шаҳри', 'город Ташкент', 'shahar'),
  (12, 1727, 'Toshkent viloyati', 'Тошкент вилояти', 'Ташкентская область', 'viloyat'),
  (13, 1730, 'Farg''ona viloyati', 'Фарғона вилояти', 'Ферганская область', 'viloyat'),
  (14, 1733, 'Xorazm viloyati', 'Хоразм вилояти', 'Хорезмская область', 'viloyat'),
  (15, 1735, 'Qoraqalpog''iston Respublikasi', 'Қорақалпоғистон Республикаси', 'Республика Каракалпакстан', 'respublika'),
  (5723, 1722, 'Surxondaryo viloyati', 'Сурхондарё вилояти', 'Сурхандарьинская область', 'viloyat')
ON CONFLICT (id) DO UPDATE SET
  soato_id = EXCLUDED.soato_id,
  name_uz = EXCLUDED.name_uz,
  name_oz = EXCLUDED.name_oz,
  name_ru = EXCLUDED.name_ru,
  region_type = EXCLUDED.region_type,
  updated_at = NOW();

-- ============================================================================
-- ЗАГРУЗКА DISTRICTS (примечание: полный список ~2641 записей)
-- ============================================================================

-- ВАЖНО: Этот файл содержит только примеры для демонстрации структуры
-- Полная загрузка должна выполняться через скрипт на Node.js/Python
-- который читает public/data/districts.json и выполняет INSERT

-- Пример для нескольких районов (для проверки):
INSERT INTO districts (id, region_id, soato_id, name_uz, name_oz, name_ru, district_type) VALUES
  -- Андижанская область (region_id = 2)
  (16, 2, 1703202, 'Oltinko''l tumani', 'Олтинкўл тумани', 'Алтынкульский район', 'tuman'),
  (17, 2, 1703203, 'Andijon tumani', 'Андижон тумани', 'Андижанский район', 'tuman'),
  (30, 2, 1703401, 'Andijon', 'Андижон', 'Андижан', 'shahar'),
  -- Бухарская область (region_id = 3)
  (32, 3, 1706204, 'Olot tumani', 'Олот тумани', 'Алатский район', 'tuman'),
  (33, 3, 1706207, 'Buxoro tumani', 'Бухоро тумани', 'Бухарский район', 'tuman'),
  (43, 3, 1706401, 'Buxoro', 'Бухоро', 'Бухара', 'shahar')
ON CONFLICT (id) DO UPDATE SET
  region_id = EXCLUDED.region_id,
  soato_id = EXCLUDED.soato_id,
  name_uz = EXCLUDED.name_uz,
  name_oz = EXCLUDED.name_oz,
  name_ru = EXCLUDED.name_ru,
  district_type = EXCLUDED.district_type,
  updated_at = NOW();

-- ПРИМЕЧАНИЕ: Для полной загрузки всех ~2641 районов используйте скрипт:
-- npx tsx scripts/load-districts-to-db.ts

