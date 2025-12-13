/**
 * Скрипт для очистки служебных записей из таблицы districts
 * 
 * Удаляет:
 * - "Toshkent shahrining tumanlari" (служебная запись, не является реальным районом)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL должен быть в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🧹 Очистка служебных записей из таблицы districts\n');

  // Находим служебные записи
  const { data: problematic, error: findError } = await supabase
    .from('districts')
    .select('*')
    .or('name_uz.ilike.%tumanlari%,name_uz.ilike.%shahrining%');

  if (findError) {
    console.error('❌ Ошибка при поиске:', findError.message);
    process.exit(1);
  }

  if (!problematic || problematic.length === 0) {
    console.log('✅ Служебных записей не найдено');
    return;
  }

  console.log(`📋 Найдено служебных записей: ${problematic.length}\n`);

  problematic.forEach((record, index) => {
    console.log(`${index + 1}. ID: ${record.id} | ${record.name_uz} | SOATO: ${record.soato_id}`);
  });

  // Удаляем служебные записи
  const idsToDelete = problematic.map(r => r.id);
  
  console.log(`\n🗑️  Удаление ${idsToDelete.length} служебных записей...`);

  const { error: deleteError } = await supabase
    .from('districts')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('❌ Ошибка при удалении:', deleteError.message);
    process.exit(1);
  }

  console.log('✅ Служебные записи успешно удалены');

  // Проверяем результат
  const { count } = await supabase
    .from('districts')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Всего районов в БД: ${count || 0}`);
}

main().catch(console.error);

