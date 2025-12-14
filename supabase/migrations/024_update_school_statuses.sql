-- Миграция: Обновление статусов школ
-- Дата: Декабрь 2025
-- Описание: Обновление CHECK constraint для status в organizations
-- Старые статусы: 'active', 'inactive', 'pending'
-- Новые статусы: 'draft', 'pending', 'published', 'rejected', 'suspended'

-- Сначала обновляем существующие данные
-- active -> published
UPDATE organizations SET status = 'published' WHERE status = 'active';

-- inactive -> suspended
UPDATE organizations SET status = 'suspended' WHERE status = 'inactive';

-- pending остается pending (это статус "на модерации")

-- Теперь удаляем старый CHECK constraint и добавляем новый
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_status_check;

ALTER TABLE organizations 
  ADD CONSTRAINT organizations_status_check 
  CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'suspended'));

-- Обновляем значение по умолчанию на 'draft' (для новых школ)
ALTER TABLE organizations ALTER COLUMN status SET DEFAULT 'draft';

-- Комментарий
COMMENT ON COLUMN organizations.status IS 'Статус школы: draft (черновик), pending (на модерации), published (опубликована), rejected (отклонена), suspended (приостановлена)';

