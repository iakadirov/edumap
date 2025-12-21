/**
 * Скрипт для импорта только новых школ из обновленного JSON файла
 * Сравнивает с предыдущим файлом и БД, импортирует только новые записи
 * 
 * Использование:
 * npx tsx scripts/import-new-schools-only.ts <old-file> <new-file>
 * 
 * Пример:
 * npx tsx scripts/import-new-schools-only.ts "c:\Users\iakad\OneDrive\Рабочий стол\Ishreja\onatili\goldenpages_bulk_131.json" "c:\Users\iakad\OneDrive\Рабочий стол\Ishreja\onatili\goldenpages_updated_256.json"
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
  'Mirzo Ulug Bek District': 'Mirzo Ulug\'bek',
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
  'Shaykhontokhur': 'Shayxontohur',
  'Shaykhontokhur district': 'Shayxontohur',
  'Uchtepa': 'Uchtepa',
  'Uchtepa district': 'Uchtepa',
  'Sergeli': 'Sergeli',
  'Sergeli district': 'Sergeli',
  'Bektemir': 'Bektemir',
  'Bektemir district': 'Bektemir',
  'Yashnabad': 'Yashnobod',
  'Yashnabad district': 'Yashnobod',
  'Yangihayot': 'Yangihayot',
  'Yangihayot district': 'Yangihayot',
};

/**
 * Нормализует название школы для сравнения
 */
function normalizeSchoolName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Проверяет, является ли школа дубликатом
 */
function isDuplicate(school1: SchoolData, school2: SchoolData): boolean {
  const name1 = normalizeSchoolName(school1.name);
  const name2 = normalizeSchoolName(school2.name);
  
  // Точное совпадение названий
  if (name1 === name2) {
    return true;
  }
  
  // Проверка на очень похожие названия (разница только в регистре или пунктуации)
  if (Math.abs(name1.length - name2.length) <= 2) {
    // Если названия очень похожи, считаем дубликатом
    const similarity = calculateSimilarity(name1, name2);
    if (similarity > 0.9) {
      return true;
    }
  }
  
  return false;
}

/**
 * Вычисляет схожесть двух строк (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Вычисляет расстояние Левенштейна
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Находит новые школы, сравнивая два файла
 */
function findNewSchools(oldSchools: SchoolData[], newSchools: SchoolData[]): SchoolData[] {
  const newSchoolsList: SchoolData[] = [];
  
  for (const newSchool of newSchools) {
    let isNew = true;
    
    // Проверяем, есть ли такая школа в старом файле
    for (const oldSchool of oldSchools) {
      if (isDuplicate(oldSchool, newSchool)) {
        isNew = false;
        break;
      }
    }
    
    if (isNew) {
      newSchoolsList.push(newSchool);
    }
  }
  
  return newSchoolsList;
}

/**
 * Проверяет, существует ли школа в БД
 */
async function schoolExistsInDB(school: SchoolData): Promise<boolean> {
  const slug = generateSlug(school.name);
  
  // Проверяем по slug
  const { data: existingBySlug } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', slug)
    .single();
  
  if (existingBySlug) {
    return true;
  }
  
  // Проверяем по нормализованному названию
  const normalizedName = normalizeSchoolName(school.name);
  const { data: existingByName } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike('name', `%${normalizedName}%`)
    .limit(5);
  
  if (existingByName && existingByName.length > 0) {
    // Проверяем схожесть
    for (const existing of existingByName) {
      const existingNormalized = normalizeSchoolName(existing.name);
      if (calculateSimilarity(normalizedName, existingNormalized) > 0.9) {
        return true;
      }
    }
  }
  
  return false;
}

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
  } else if (addressLower.includes('samarkand') || addressLower.includes('samarqand')) {
    city = 'Samarqand';
  } else if (addressLower.includes('andijan') || addressLower.includes('andijon')) {
    city = 'Andijon';
  } else if (addressLower.includes('namangan')) {
    city = 'Namangan';
  } else if (addressLower.includes('bukhara') || addressLower.includes('buxoro')) {
    city = 'Buxoro';
  } else if (addressLower.includes('navoi') || addressLower.includes('navoiy')) {
    city = 'Navoiy';
  } else if (addressLower.includes('jizzakh') || addressLower.includes('jizzax')) {
    city = 'Jizzax';
  } else if (addressLower.includes('gulistan') || addressLower.includes('guliston')) {
    city = 'Guliston';
  } else if (addressLower.includes('nukus')) {
    city = 'Nukus';
  } else if (addressLower.includes('karshi') || addressLower.includes('qarshi')) {
    city = 'Qarshi';
  } else if (addressLower.includes('termiz') || addressLower.includes('termez')) {
    city = 'Termiz';
  } else if (addressLower.includes('khiva') || addressLower.includes('xiva')) {
    city = 'Xiva';
  } else if (addressLower.includes('chirchik')) {
    city = 'Chirchik';
  } else if (addressLower.includes('kokand') || addressLower.includes('qo\'qon')) {
    city = 'Qo\'qon';
  } else if (addressLower.includes('almalyk')) {
    city = 'Almalyk';
  }
  
  // Определяем район
  let district: string | undefined;
  for (const [key, value] of Object.entries(districtNameMapping)) {
    const keyLower = key.toLowerCase();
    if (addressLower.includes(keyLower) || 
        addressLower.includes(keyLower.replace(/-/g, ' ')) ||
        addressLower.includes(keyLower.replace(/\s+/g, '-'))) {
      district = value;
      break;
    }
  }
  
  // Если не нашли по маппингу, пытаемся извлечь из адреса
  if (!district) {
    const patterns = [
      /(\w+)\s*(?:district|tumani|tuman)/i,
      /(?:district|tumani|tuman)\s+(\w+)/i,
      /(\w+)\s+district/i,
    ];
    
    for (const pattern of patterns) {
      const match = address.match(pattern);
      if (match && match[1]) {
        const districtName = match[1];
        if (districtNameMapping[districtName]) {
          district = districtNameMapping[districtName];
          break;
        }
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
  
  let regionId: number | null = null;
  if (city === 'Toshkent') {
    regionId = 11;
  } else if (city === 'Farg\'ona') {
    regionId = 13;
  } else if (city === 'Samarqand') {
    regionId = 8;
  } else if (city === 'Andijon') {
    regionId = 2;
  } else if (city === 'Namangan') {
    regionId = 7;
  } else if (city === 'Buxoro') {
    regionId = 3;
  } else if (city === 'Navoiy') {
    regionId = 6;
  } else if (city === 'Jizzax') {
    regionId = 4;
  } else if (city === 'Guliston') {
    regionId = 10;
  }
  
  if (!regionId) {
    return null;
  }
  
  const searchPattern = `%${districtName}%`;
  const { data, error } = await supabase
    .from('districts')
    .select('id, name_uz, name_ru')
    .eq('region_id', regionId)
    .or(`name_uz.ilike.${searchPattern},name_ru.ilike.${searchPattern}`)
    .limit(10);
  
  if (error || !data || data.length === 0) {
    return null;
  }
  
  if (data.length > 1) {
    const exactMatch = data.find(d => 
      d.name_uz?.toLowerCase() === districtName.toLowerCase() ||
      d.name_ru?.toLowerCase() === districtName.toLowerCase()
    );
    
    if (exactMatch) {
      return exactMatch.id;
    }
  }
  
  return data[0].id;
}

/**
 * Находит region_id по городу
 */
function findRegionId(city: string | undefined): number | null {
  if (!city) return null;
  
  const regionMap: Record<string, number> = {
    'Toshkent': 11,
    'Farg\'ona': 13,
    'Samarqand': 8,
    'Andijon': 2,
    'Namangan': 7,
    'Buxoro': 3,
    'Navoiy': 6,
    'Jizzax': 4,
    'Guliston': 10,
  };
  
  return regionMap[city] || null;
}

/**
 * Импортирует одну школу
 */
async function importSchool(schoolData: SchoolData, index: number, total: number): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    // Проверяем, не существует ли уже в БД
    const exists = await schoolExistsInDB(schoolData);
    if (exists) {
      console.log(`⏭️  Пропущена (уже в БД): ${schoolData.name}`);
      return { success: false, error: 'Already exists in DB' };
    }
    
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
      name_uz: schoolData.name,
      slug: uniqueSlug,
      description: null,
      status: 'draft',
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
      school_type: 'private',
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
  const oldFilePath = process.argv[2];
  const newFilePath = process.argv[3];
  
  if (!oldFilePath || !newFilePath) {
    console.error('❌ Ошибка: Укажите пути к обоим JSON файлам');
    console.log('Использование: npx tsx scripts/import-new-schools-only.ts <old-file> <new-file>');
    process.exit(1);
  }
  
  try {
    console.log('📖 Чтение файлов...');
    const oldFileContent = readFileSync(oldFilePath, 'utf-8');
    const newFileContent = readFileSync(newFilePath, 'utf-8');
    
    const oldSchools: SchoolData[] = JSON.parse(oldFileContent);
    const newSchools: SchoolData[] = JSON.parse(newFileContent);
    
    console.log(`\n📊 Старый файл: ${oldSchools.length} школ`);
    console.log(`📊 Новый файл: ${newSchools.length} школ`);
    
    // Находим новые школы
    console.log('\n🔍 Поиск новых школ...');
    const newSchoolsList = findNewSchools(oldSchools, newSchools);
    
    console.log(`\n✨ Найдено новых школ: ${newSchoolsList.length}`);
    
    if (newSchoolsList.length === 0) {
      console.log('✅ Все школы уже были импортированы!');
      return;
    }
    
    console.log('🚀 Начинаем импорт новых школ...\n');
    
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };
    
    const errors: Array<{ name: string; error: string }> = [];
    
    for (let i = 0; i < newSchoolsList.length; i++) {
      const school = newSchoolsList[i];
      
      if (!school.name || !school.name.trim()) {
        console.log(`⏭️  Пропущена запись ${i + 1}: нет названия`);
        results.skipped++;
        continue;
      }
      
      const result = await importSchool(school, i, newSchoolsList.length);
      
      if (result.success) {
        results.success++;
      } else if (result.error === 'Already exists in DB') {
        results.skipped++;
      } else {
        results.failed++;
        errors.push({ name: school.name, error: result.error || 'Unknown error' });
      }
      
      // Небольшая задержка
      if (i < newSchoolsList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📈 Результаты импорта:');
    console.log(`✅ Успешно: ${results.success}`);
    console.log(`❌ Ошибок: ${results.failed}`);
    console.log(`⏭️  Пропущено (дубликаты): ${results.skipped}`);
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

