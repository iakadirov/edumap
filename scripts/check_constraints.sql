-- Скрипт для проверки всех constraints в таблице school_details
-- Выполните в Supabase SQL Editor для диагностики

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'school_details'::regclass
ORDER BY conname;