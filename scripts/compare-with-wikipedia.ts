/**
 * Скрипт для сравнения данных в БД с данными из Википедии
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL должен быть в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Данные из Википедии (по состоянию на 2020 год)
const wikipediaData: Record<number, { name: string; tuman: number; shahar: number; total: number }> = {
  2: { name: 'Андижанская область', tuman: 14, shahar: 2, total: 16 },
  3: { name: 'Бухарская область', tuman: 11, shahar: 2, total: 13 },
  4: { name: 'Джизакская область', tuman: 12, shahar: 1, total: 13 },
  5: { name: 'Кашкадарьинская область', tuman: 13, shahar: 1, total: 14 },
  6: { name: 'Навоийская область', tuman: 8, shahar: 2, total: 10 },
  7: { name: 'Наманганская область', tuman: 11, shahar: 1, total: 12 },
  8: { name: 'Самаркандская область', tuman: 14, shahar: 2, total: 16 },
  10: { name: 'Сырдарьинская область', tuman: 8, shahar: 3, total: 11 },
  11: { name: 'Город Ташкент', tuman: 11, shahar: 0, total: 11 },
  12: { name: 'Ташкентская область', tuman: 15, shahar: 4, total: 19 },
  13: { name: 'Ферганская область', tuman: 15, shahar: 4, total: 19 },
  14: { name: 'Хорезмская область', tuman: 10, shahar: 1, total: 11 },
  15: { name: 'Республика Каракалпакстан', tuman: 15, shahar: 1, total: 16 },
  5723: { name: 'Сурхандарьинская область', tuman: 13, shahar: 1, total: 14 },
};

async function main() {
  console.log('📊 Сравнение данных БД с данными Википедии\n');
  console.log('Регион | Ожидается | В БД | Разница | Статус');
  console.log('─'.repeat(70));

  const issues: Array<{ region: string; district: string; reason: string }> = [];

  for (const [regionIdStr, expected] of Object.entries(wikipediaData)) {
    const regionId = parseInt(regionIdStr, 10);
    
    const { data: districts, error } = await supabase
      .from('districts')
      .select('id, name_uz, name_ru, district_type')
      .eq('region_id', regionId)
      .order('name_uz');

    if (error) {
      console.error(`❌ Ошибка для региона ${regionId}:`, error.message);
      continue;
    }

    const actual = districts?.length || 0;
    const diff = actual - expected.total;
    const status = diff === 0 ? '✅' : diff > 0 ? '⚠️ +' + diff : '❌ ' + diff;

    console.log(
      `${expected.name.padEnd(25)} | ${expected.total.toString().padStart(3)} | ${actual.toString().padStart(3)} | ${diff.toString().padStart(6)} | ${status}`
    );

    // Проверяем лишние записи
    if (diff > 0 && districts) {
      const tumanCount = districts.filter(d => d.district_type === 'tuman').length;
      const shaharCount = districts.filter(d => d.district_type === 'shahar').length;

      // Если больше чем ожидается, находим проблемные
      if (tumanCount > expected.tuman || shaharCount > expected.shahar) {
        districts.forEach(d => {
          if (d.district_type === 'tuman' && tumanCount > expected.tuman) {
            // Проверяем, может быть это служебная запись
            if (d.name_uz.toLowerCase().includes('tumanlari') || 
                d.name_uz.toLowerCase().includes('shahrining')) {
              issues.push({
                region: expected.name,
                district: d.name_uz,
                reason: 'Служебная запись (возможно нужно исключить)'
              });
            }
          }
        });
      }

      // Показываем все записи для проблемных регионов
      if (Math.abs(diff) > 0) {
        console.log(`   Детали:`);
        districts?.forEach(d => {
          const marker = 
            (d.name_uz.toLowerCase().includes('tumanlari') || 
             d.name_uz.toLowerCase().includes('shahrining')) ? ' ⚠️' : '';
          console.log(`     - ${d.name_uz} (${d.district_type})${marker}`);
        });
        console.log('');
      }
    }
  }

  // Итоговая статистика
  const { count: totalActual } = await supabase
    .from('districts')
    .select('*', { count: 'exact', head: true });

  const totalExpected = Object.values(wikipediaData).reduce((sum, e) => sum + e.total, 0);

  console.log('─'.repeat(70));
  console.log(
    `Итого: | ${totalExpected.toString().padStart(3)} | ${(totalActual || 0).toString().padStart(3)} | ${((totalActual || 0) - totalExpected).toString().padStart(6)}`
  );

  if (issues.length > 0) {
    console.log('\n⚠️ Проблемные записи:');
    issues.forEach(issue => {
      console.log(`   - ${issue.region}: ${issue.district} (${issue.reason})`);
    });
  }

  console.log('\n📝 Примечания:');
  console.log('   - Данные Википедии актуальны на 2020 год');
  console.log('   - В JSON файле могут быть более свежие данные');
  console.log('   - Разница может быть из-за административных изменений');
}

main().catch(console.error);

