-- Миграция: Исправление CHECK constraint для status в organizations
-- Дата: 2025-12-14
-- Описание: Принудительное обновление constraint для статусов
-- Старые статусы: 'active', 'inactive', 'pending'
-- Новые статусы: 'draft', 'pending', 'published', 'rejected', 'suspended'

-- ВАЖНО: Сначала удаляем constraint, потом обновляем данные, потом добавляем новый constraint

-- Шаг 1: Удаляем старый constraint (все возможные варианты имени)
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_status_check;

-- Шаг 2: Обновляем существующие данные (теперь constraint удален, можем обновлять)
UPDATE organizations
SET
    status = 'published'
WHERE
    status = 'active';

UPDATE organizations
SET
    status = 'suspended'
WHERE
    status = 'inactive';

-- Шаг 3: Добавляем новый constraint с правильными статусами
ALTER TABLE organizations
ADD CONSTRAINT organizations_status_check CHECK (
    status IN (
        'draft',
        'pending',
        'published',
        'rejected',
        'suspended'
    )
);

-- Шаг 4: Обновляем значение по умолчанию
ALTER TABLE organizations ALTER COLUMN status SET DEFAULT 'draft';

-- Комментарий
COMMENT ON COLUMN organizations.status IS 'Статус школы: draft (черновик), pending (на модерации), published (опубликована), rejected (отклонена), suspended (приостановлена)';