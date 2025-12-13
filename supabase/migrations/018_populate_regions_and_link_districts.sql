-- Миграция: Заполнение поля region и связывание с районами
-- Дата: 2025-12-26
-- Задача: Заполнить поле region для существующих записей на основе city и district

-- Обновляем region на основе city
-- Ташкентские районы → Toshkent shahri
UPDATE organizations
SET region = 'Toshkent shahri'
WHERE city = 'Ташкент'
  AND district IN (
    'Мирабадский', 'Юнусабадский', 'Шайхантахурский', 
    'Чиланзарский', 'Учтепинский', 'Центральный', 'Яшнабадский',
    'Яккасарайский', 'Мирзо-Улугбекский', 'Олмазорский', 
    'Алмазарский', 'Сергелийский', 'Бектемирский'
  )
  AND (region IS NULL OR region = '');

-- Андижан → Andijon viloyati
UPDATE organizations
SET region = 'Andijon viloyati'
WHERE city = 'Андижан'
  AND (region IS NULL OR region = '');

-- Наманган → Namangan viloyati
UPDATE organizations
SET region = 'Namangan viloyati'
WHERE city = 'Наманган'
  AND (region IS NULL OR region = '');

-- Можно добавить другие города по мере необходимости

-- Комментарий
COMMENT ON COLUMN organizations.region IS 'Область (используется name_uz из regions.json: Toshkent shahri, Andijon viloyati, и т.д.)';

