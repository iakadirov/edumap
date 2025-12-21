-- Добавление поля detailed_description для подробного описания школы
-- Лимит: 5000 символов, минимум: нет

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS detailed_description TEXT CHECK (
    detailed_description IS NULL OR 
    LENGTH(detailed_description) <= 5000
  );

-- Комментарий к полю
COMMENT ON COLUMN organizations.detailed_description IS 'Подробное описание школы (до 5000 символов)';

