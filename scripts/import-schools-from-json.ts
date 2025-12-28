/**
 * Скрипт для импорта школ из JSON файла
 * 
 * Использование:
 * tsx scripts/import-schools-from-json.ts <path-to-json-file>
 * 
 * Пример:
 * tsx scripts/import-schools-from-json.ts "c:\Users\iakad\OneDrive\Рабочий стол\Ishreja\onatili\goldenpages_bulk_131.json"
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { generateSlug, generateUniqueSlug } from '../src/lib/utils/slug';
import { normalizePhone } from '../src/lib/utils/phone';
import { normalizeWebsite } from '../src/lib/utils/website';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения SUPABASE_URL или SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SchoolData {
  name: string;
  address: string;
  phone: string;
  landmarks: string;
  website: string;
}

// Маппинг названий районов из адреса к названиям в БД
const districtNameMapping: Record<string, string> = {
  'Mirzo-Ulugbek': 'Mirzo Ulug\'bek',
  'Mirzo Ulugbek': 'Mirzo Ulug\'bek',
  'Mirzo-Ulugbek District': 'Mirzo Ulug\'bek',
  'Mirzo Ulugbek District': 'Mirzo Ulug\'bek',
  'Chilanzar': 'Chilonzor',
  'Chilanzar district': 'Chilonzor',
  'Yakkasaray': 'Yakkasaray',
  'Yakkasaray district': 'Yakkasaray',
  'Mirabad': 'Mirobod',
  'Mirabad district': 'Mirobod',
  'Almazar': 'Olmazor',
  'Almazar district': 'Olmazor',
  'Yunusabad': 'Yunusobod',
  'Yunusabad district': 'Yunusobod',
  'Shaykhantahur': 'Shayxontohur',
  'Shaykhantahur District': 'Shayxontohur',
  'Uchtepa': 'Uchtepa',
  'Uchtepa district': 'Uchtepa',
  'Sergeli': 'Sergeli',
  'Sergeli district': 'Sergeli',
  'Bektemir': 'Bektemir',
  'Bektemir district': 'Bektemir',
  'Yashnabad': 'Yashnobod',
  'Yashnabad district': 'Yashnobod',
};

// Маппинг городов
const cityMapping: Record<string, string> = {
  'Tashkent': 'Toshkent',
  'Ferghana': 'Farg\'ona',
  'Fergana': 'Farg\'ona',
  'Yazyavan': 'Yazyavan',
};

/**
 * Парсит адрес и извлекает район и город
 */
function parseAddress(address: string): { district?: string; city?: string } {
  const addressLower = address.toLowerCase();
  
  // Определяем город
  let city: string | undefined;
  if (addressLower.includes('tashkent')) {
    city = 'Toshkent';
  } else if (addressLower.includes('ferghana') || addressLower.includes('fergana')) {
    city = 'Farg\'ona';
  } else if (addressLower.includes('yazyavan')) {
    city = 'Yazyavan';
  }
  
  // Определяем район - проверяем все варианты названий
  let district: string | undefined;
  
  // Сначала проверяем точные совпадения из маппинга
  for (const [key, value] of Object.entries(districtNameMapping)) {
    const keyLower = key.toLowerCase();
    // Проверяем разные варианты написания
    if (addressLower.includes(keyLower) || 
        addressLower.includes(keyLower.replace(/-/g, ' ')) ||
        addressLower.includes(keyLower.replace(/\s+/g, '-'))) {
      district = value;
      break;
    }
  }
  
  // Если не нашли по маппингу, пытаемся извлечь из адреса
  if (!district) {
    // Паттерны для поиска района в адресе
    const patterns = [
      /(\w+)\s*(?:district|tumani|tuman)/i,
      /(?:district|tumani|tuman)\s+(\w+)/i,
      /(\w+)\s+district/i,
    ];
    
    for (const pattern of patterns) {
      const match = address.match(pattern);
      if (match && match[1]) {
        const districtName = match[1];
        // Проверяем, есть ли это название в маппинге
        if (districtNameMapping[districtName]) {
          district = districtNameMapping[districtName];
          break;
        }
        // Иначе используем как есть
        district = districtName;
        break;
      }
    }
  }
  
  return { district, city };
}

/**
 * Находит district_id по названию района
 */
async function findDistrictId(districtName: string | undefined, city: string | undefined): Promise<number | null> {
  if (!districtName) return null;
  
  // Для Ташкента region_id = 11
  // Для Ферганы region_id = 13
  let regionId: number | null = null;
  if (city === 'Toshkent') {
    regionId = 11;
  } else if (city === 'Farg\'ona') {
    regionId = 13;
  }
  
  if (!regionId) {
    // Для других городов нужно определить region_id
    // Пока возвращаем null, можно расширить логику
    return null;
  }
  
  // Ищем район в БД
  const query = supabase
    .from('districts')
    .select('id, name_uz, name_ru')
    .eq('region_id', regionId);
  
  // Пытаемся найти по разным вариантам названия
  const { data, error } = await query
    .or(`name_uz.ilike.%${districtName}%,name_ru.ilike.%${districtName}%`)
    .limit(5);
  
  if (error || !data || data.length === 0) {
    console.warn(`⚠️  Район не найден: ${districtName}`);
    return null;
  }
  
  // Если нашли несколько, берем первый
  if (data.length > 1) {
    console.warn(`⚠️  Найдено несколько районов для "${districtName}", используется первый: ${data[0].name_uz}`);
  }
  
  return data[0].id;
}

/**
 * Находит region_id по городу
 */
function findRegionId(city: string | undefined): number | null {
  if (!city) return null;
  
  // Для Ташкента region_id = 11
  if (city === 'Toshkent') return 11;
  
  // Для Ферганы region_id = 13
  if (city === 'Farg\'ona') return 13;
  
  // Для других городов можно расширить логику
  return null;
}

/**
 * Импортирует одну школу
 */
async function importSchool(schoolData: SchoolData, index: number, total: number): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    console.log(`\n[${index + 1}/${total}] Импорт: ${schoolData.name}`);
    
    // Генерируем slug
    const baseSlug = generateSlug(schoolData.name);
    
    // Проверяем уникальность slug
    const { data: existingSlugs } = await supabase
      .from('organizations')
      .select('slug')
      .not('slug', 'is', null);
    
    const slugs = existingSlugs?.map(s => s.slug).filter(Boolean) || [];
    const uniqueSlug = generateUniqueSlug(baseSlug, slugs);
    
    // Парсим адрес
    const { district, city } = parseAddress(schoolData.address);
    
    // Находим district_id и region_id
    const districtId = await findDistrictId(district, city);
    const regionId = await findRegionId(city);
    
    // Нормализуем данные
    const normalizedPhone = normalizePhone(schoolData.phone) || null;
    const normalizedWebsite = normalizeWebsite(schoolData.website) || null;
    
    // Создаем организацию
    const organizationData = {
      org_type: 'school',
      name: schoolData.name,
      name_uz: schoolData.name, // Можно будет заполнить позже
      slug: uniqueSlug,
      description: null,
      status: 'draft', // Ставим draft, чтобы потом заполнить данные
      phone: normalizedPhone,
      website: normalizedWebsite,
      address: schoolData.address || null,
      landmark: schoolData.landmarks || null,
      district: district || null,
      city: city || null,
      region_id: regionId,
      district_id: districtId,
      is_verified: false,
    };
    
    const { data: newOrganization, error: orgError } = await supabase
      .from('organizations')
      .insert(organizationData)
      .select()
      .single();
    
    if (orgError) {
      console.error(`❌ Ошибка создания организации: ${orgError.message}`);
      return { success: false, error: orgError.message };
    }
    
    // Создаем school_details с базовыми данными
    const schoolDetailsData = {
      organization_id: newOrganization.id,
      school_type: 'private', // По умолчанию private, можно будет изменить
      grade_from: 1,
      grade_to: 11,
      accepts_preparatory: false,
      accepted_grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      primary_language: 'uzbek',
      additional_languages: null,
      curriculum: ['national'],
      fee_monthly_min: null,
      fee_monthly_max: null,
      pricing_tiers: null,
    };
    
    const { error: detailsError } = await supabase
      .from('school_details')
      .insert(schoolDetailsData);
    
    if (detailsError) {
      console.error(`❌ Ошибка создания school_details: ${detailsError.message}`);
      // Удаляем созданную организацию
      await supabase.from('organizations').delete().eq('id', newOrganization.id);
      return { success: false, error: detailsError.message };
    }
    
    console.log(`✅ Успешно создана: ${schoolData.name} (slug: ${uniqueSlug})`);
    return { success: true, slug: uniqueSlug };
    
  } catch (error: any) {
    console.error(`❌ Ошибка при импорте ${schoolData.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Основная функция
 */
async function main() {
  const jsonFilePath = process.argv[2];
  
  if (!jsonFilePath) {
    console.error('❌ Ошибка: Укажите путь к JSON файлу');
    console.log('Использование: tsx scripts/import-schools-from-json.ts <path-to-json-file>');
    process.exit(1);
  }
  
  try {
    console.log('📖 Чтение JSON файла...');
    const fileContent = readFileSync(jsonFilePath, 'utf-8');
    const schools: SchoolData[] = JSON.parse(fileContent);
    
    console.log(`\n📊 Найдено школ: ${schools.length}`);
    console.log('🚀 Начинаем импорт...\n');
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };
    
    const errors: Array<{ name: string; error: string }> = [];
    
    for (let i = 0; i < schools.length; i++) {
      const school = schools[i];
      
      // Пропускаем пустые записи
      if (!school.name || !school.name.trim()) {
        console.log(`⏭️  Пропущена запись ${i + 1}: нет названия`);
        results.skipped++;
        continue;
      }
      
      const result = await importSchool(school, i, schools.length);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        errors.push({ name: school.name, error: result.error || 'Unknown error' });
      }
      
      // Небольшая задержка, чтобы не перегружать БД
      if (i < schools.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 Результаты импорта:');
    console.log(`✅ Успешно: ${results.success}`);
    console.log(`❌ Ошибок: ${results.failed}`);
    console.log(`⏭️  Пропущено: ${results.skipped}`);
    console.log('='.repeat(60));
    
    if (errors.length > 0) {
      console.log('\n❌ Ошибки:');
      errors.forEach(({ name, error }) => {
        console.log(`  - ${name}: ${error}`);
      });
    }
    
    console.log('\n✨ Импорт завершен!');
    
  } catch (error: any) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);

