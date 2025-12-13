/**
 * Скрипт для проверки данных областей и регионов в БД
 * 
 * Запуск: npx tsx scripts/check-regions-in-db.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY должны быть в .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🔍 Проверка данных областей и регионов в БД\n');

  // 1. Проверяем уникальные значения region
  console.log('📊 Уникальные значения region:');
  const { data: regions, error: regionsError } = await supabase
    .from('organizations')
    .select('region')
    .not('region', 'is', null);

  if (regionsError) {
    console.error('❌ Ошибка при получении regions:', regionsError);
  } else {
    const uniqueRegions = [...new Set((regions || []).map(r => r.region))];
    console.log(`   Найдено ${uniqueRegions.length} уникальных областей:`);
    uniqueRegions.slice(0, 20).forEach((region, i) => {
      console.log(`   ${i + 1}. ${region}`);
    });
    if (uniqueRegions.length > 20) {
      console.log(`   ... и еще ${uniqueRegions.length - 20}`);
    }
  }

  // 2. Проверяем уникальные значения district
  console.log('\n📊 Уникальные значения district:');
  const { data: districts, error: districtsError } = await supabase
    .from('organizations')
    .select('district')
    .not('district', 'is', null)
    .eq('org_type', 'school')
    .eq('status', 'active');

  if (districtsError) {
    console.error('❌ Ошибка при получении districts:', districtsError);
  } else {
    const uniqueDistricts = [...new Set((districts || []).map(d => d.district))];
    console.log(`   Найдено ${uniqueDistricts.length} уникальных районов:`);
    uniqueDistricts.slice(0, 20).forEach((district, i) => {
      console.log(`   ${i + 1}. ${district}`);
    });
    if (uniqueDistricts.length > 20) {
      console.log(`   ... и еще ${uniqueDistricts.length - 20}`);
    }
  }

  // 3. Проверяем связь region - district
  console.log('\n📊 Связь region - district (первые 10 примеров):');
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('region, district, city')
    .not('region', 'is', null)
    .not('district', 'is', null)
    .eq('org_type', 'school')
    .eq('status', 'active')
    .limit(10);

  if (orgsError) {
    console.error('❌ Ошибка при получении organizations:', orgsError);
  } else {
    orgs?.forEach((org, i) => {
      console.log(`   ${i + 1}. ${org.region} → ${org.district} (${org.city})`);
    });
  }

  // 4. Статистика заполненности
  console.log('\n📈 Статистика заполненности:');
  const { count: totalCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('org_type', 'school')
    .eq('status', 'active');

  const { count: withRegion } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('org_type', 'school')
    .eq('status', 'active')
    .not('region', 'is', null);

  const { count: withDistrict } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .eq('org_type', 'school')
    .eq('status', 'active')
    .not('district', 'is', null);

  console.log(`   Всего активных школ: ${totalCount || 0}`);
  console.log(`   С заполненным region: ${withRegion || 0} (${totalCount ? Math.round((withRegion || 0) / totalCount * 100) : 0}%)`);
  console.log(`   С заполненным district: ${withDistrict || 0} (${totalCount ? Math.round((withDistrict || 0) / totalCount * 100) : 0}%)`);

  console.log('\n✅ Проверка завершена\n');
}

main().catch(console.error);

