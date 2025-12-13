/**
 * Скрипт для сравнения данных БД с официальным API статистики Узбекистана
 * API: https://api.siat.stat.uz/media/uploads/sdmx/sdmx_data_223.json
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import * as https from 'https';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL должен быть в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface StatApiDistrict {
  Code: string;
  Klassifikator: string;
  Klassifikator_ru: string;
  Klassifikator_en: string;
  Klassifikator_uzc: string;
}

function fetchStatApi(): Promise<StatApiDistrict[]> {
  return new Promise((resolve, reject) => {
    https.get('https://api.siat.stat.uz/media/uploads/sdmx/sdmx_data_223.json', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // API возвращает массив с одним объектом, содержащим массив data
          const districts = json[0]?.data || [];
          resolve(districts);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('📊 Сравнение данных БД с официальным API статистики\n');
  console.log('Загрузка данных из API...\n');

  try {
    // Загружаем данные из API
    const apiDistricts = await fetchStatApi();
    
    // Извлекаем уникальные районы (по коду SOATO)
    const apiDistrictsMap = new Map<string, StatApiDistrict>();
    apiDistricts.forEach(d => {
      if (d.Code && d.Klassifikator) {
        apiDistrictsMap.set(d.Code, d);
      }
    });

    console.log(`✅ Загружено ${apiDistrictsMap.size} районов из API\n`);

    // Загружаем данные из БД
    const { data: dbDistricts, error } = await supabase
      .from('districts')
      .select('id, region_id, soato_id, name_uz, name_ru, district_type')
      .order('region_id, name_uz');

    if (error) {
      console.error('❌ Ошибка при загрузке из БД:', error.message);
      process.exit(1);
    }

    console.log(`✅ Загружено ${dbDistricts?.length || 0} районов из БД\n`);

    // Сравниваем по коду SOATO
    console.log('Сравнение по коду SOATO:\n');
    console.log('Код SOATO | API название | БД название | Статус');
    console.log('─'.repeat(80));

    const matched: Array<{ code: string; api: string; db: string }> = [];
    const onlyInApi: Array<StatApiDistrict> = [];
    const onlyInDb: Array<any> = [];

    // Проверяем районы из API
    for (const [code, apiDistrict] of apiDistrictsMap.entries()) {
      const dbDistrict = dbDistricts?.find(d => d.soato_id?.toString() === code);
      
      if (dbDistrict) {
        matched.push({
          code,
          api: apiDistrict.Klassifikator_ru,
          db: dbDistrict.name_ru || dbDistrict.name_uz
        });
      } else {
        onlyInApi.push(apiDistrict);
      }
    }

    // Проверяем районы из БД, которых нет в API
    for (const dbDistrict of dbDistricts || []) {
      if (dbDistrict.soato_id) {
        const code = dbDistrict.soato_id.toString();
        if (!apiDistrictsMap.has(code)) {
          onlyInDb.push(dbDistrict);
        }
      }
    }

    // Показываем первые 20 совпадений
    matched.slice(0, 20).forEach(({ code, api, db }) => {
      const match = api.toLowerCase() === db.toLowerCase() ? '✅' : '⚠️';
      console.log(`${code.padEnd(10)} | ${api.substring(0, 25).padEnd(25)} | ${db.substring(0, 25).padEnd(25)} | ${match}`);
    });

    if (matched.length > 20) {
      console.log(`... и еще ${matched.length - 20} совпадений`);
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n📊 Статистика:`);
    console.log(`   - Совпадений: ${matched.length}`);
    console.log(`   - Только в API: ${onlyInApi.length}`);
    console.log(`   - Только в БД: ${onlyInDb.length}`);

    // Анализируем районы только в API
    if (onlyInApi.length > 0) {
      console.log(`\n⚠️ Районы, которые есть в API, но отсутствуют в БД:`);
      onlyInApi.slice(0, 10).forEach(d => {
        console.log(`   - ${d.Klassifikator_ru} (SOATO: ${d.Code})`);
      });
      if (onlyInApi.length > 10) {
        console.log(`   ... и еще ${onlyInApi.length - 10} районов`);
      }
    }

    // Анализируем районы только в БД
    if (onlyInDb.length > 0) {
      console.log(`\n⚠️ Районы, которые есть в БД, но отсутствуют в API:`);
      onlyInDb.slice(0, 20).forEach(d => {
        const regionInfo = d.region_id === 11 ? 'Ташкент' : `Регион ${d.region_id}`;
        console.log(`   - ${d.name_ru || d.name_uz} (${regionInfo}, SOATO: ${d.soato_id || 'нет'})`);
      });
      if (onlyInDb.length > 20) {
        console.log(`   ... и еще ${onlyInDb.length - 20} районов`);
      }
    }

    // Специальная проверка для Ташкента (коды SOATO начинаются с 1726)
    console.log(`\n🏙️ Районы города Ташкента (SOATO начинается с 1726):`);
    const tashkentApi = Array.from(apiDistrictsMap.values())
      .filter(d => d.Code.startsWith('1726'))
      .sort((a, b) => a.Code.localeCompare(b.Code));
    
    const tashkentDb = dbDistricts?.filter(d => 
      d.region_id === 11 && d.soato_id && d.soato_id.toString().startsWith('1726')
    ) || [];

    console.log(`   - В API: ${tashkentApi.length} районов`);
    console.log(`   - В БД: ${tashkentDb.length} районов`);
    console.log(`\n   Районы Ташкента из API:`);
    tashkentApi.forEach((d, i) => {
      const dbMatch = tashkentDb.find(db => db.soato_id?.toString() === d.Code);
      const status = dbMatch ? '✅' : '❌';
      console.log(`   ${(i + 1).toString().padStart(2)}. ${d.Klassifikator_ru.padEnd(30)} (${d.Code}) ${status}`);
    });

    console.log(`\n   Районы Ташкента из БД:`);
    tashkentDb.forEach((d, i) => {
      const apiMatch = tashkentApi.find(api => api.Code === d.soato_id?.toString());
      const status = apiMatch ? '✅' : '⚠️';
      console.log(`   ${(i + 1).toString().padStart(2)}. ${(d.name_ru || d.name_uz).padEnd(30)} (${d.soato_id || 'нет'}) ${status}`);
    });

    console.log(`\n📝 Примечания:`);
    console.log(`   - API данные официальные от статистического комитета Узбекистана`);
    console.log(`   - Дата последнего изменения в API: 2022-08-04`);
    console.log(`   - JSON файл может содержать более свежие данные (2022-2024)`);

  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

