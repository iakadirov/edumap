/**
 * Скрипт для загрузки районов (districts) из JSON в базу данных
 * 
 * Запуск: npx tsx scripts/load-districts-to-db.ts
 * 
 * Требования:
 * - Файл public/data/districts.json должен существовать
 * - Миграция 019_create_regions_districts_tables.sql должна быть применена
 * - Миграция 020_load_regions_districts_data.sql должна быть применена (для regions)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface District {
  id: number;
  region_id: number;
  soato_id: number;
  name_uz: string;
  name_oz: string;
  name_ru: string;
}

function determineDistrictType(nameUz: string): 'tuman' | 'shahar' {
  // Если в названии есть "tumani" - это район
  if (nameUz.toLowerCase().includes('tumani')) {
    return 'tuman';
  }
  // Иначе это город областного подчинения
  return 'shahar';
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY должны быть в .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Читаем файл districts.json
  const districtsPath = path.join(process.cwd(), 'public/data/districts.json');
  
  if (!fs.existsSync(districtsPath)) {
    console.error(`❌ Файл не найден: ${districtsPath}`);
    process.exit(1);
  }

  console.log('📖 Читаем districts.json...');
  const districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf-8')) as District[];

  console.log(`📊 Найдено ${districtsData.length} районов для загрузки\n`);

  // Проверяем, что таблицы существуют
  const { error: checkError } = await supabase
    .from('regions')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('❌ Ошибка: таблица regions не существует. Примените миграцию 019_create_regions_districts_tables.sql');
    process.exit(1);
  }

  // Проверяем, что regions загружены
  const { count: regionsCount } = await supabase
    .from('regions')
    .select('*', { count: 'exact', head: true });

  if (!regionsCount || regionsCount === 0) {
    console.error('❌ Ошибка: таблица regions пуста. Примените миграцию 020_load_regions_districts_data.sql');
    process.exit(1);
  }

  console.log(`✅ Найдено ${regionsCount} областей в БД\n`);

  // Подготавливаем данные для вставки
  const districtsToInsert = districtsData.map(district => ({
    id: district.id,
    region_id: district.region_id,
    soato_id: district.soato_id,
    name_uz: district.name_uz,
    name_oz: district.name_oz || null,
    name_ru: district.name_ru,
    district_type: determineDistrictType(district.name_uz),
  }));

  // Вставляем батчами по 100 записей
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  console.log('💾 Начинаем загрузку данных...\n');

  for (let i = 0; i < districtsToInsert.length; i += batchSize) {
    const batch = districtsToInsert.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('districts')
      .upsert(batch, {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`❌ Ошибка при вставке батча ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      const progress = ((i + batch.length) / districtsToInsert.length * 100).toFixed(1);
      console.log(`✅ Загружено ${inserted}/${districtsToInsert.length} (${progress}%)`);
    }
  }

  console.log('\n✅ Загрузка завершена!');
  console.log(`📊 Статистика:`);
  console.log(`   - Загружено: ${inserted}`);
  console.log(`   - Ошибок: ${errors}`);

  // Проверяем результат
  const { count: finalCount } = await supabase
    .from('districts')
    .select('*', { count: 'exact', head: true });

  console.log(`   - Всего в БД: ${finalCount || 0}\n`);
}

main().catch(console.error);

