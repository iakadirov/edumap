/**
 * Утилиты для генерации динамических заголовков и описаний страниц
 */

import { createClient } from '@/lib/supabase/server';
import { getRegionById, getDistrictById } from '@/lib/utils/regions-data';

const schoolTypeLabels: Record<string, string> = {
  private: 'xususiy',
  state: 'davlat',
  international: 'xalqaro',
};

/**
 * Получить название региона по ID
 */
export async function getRegionNameById(regionId: number | null | undefined): Promise<string | null> {
  if (!regionId) return null;
  
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from('regions')
      .select('name_uz')
      .eq('id', regionId)
      .single();
    
    if (error || !data) return null;
    return data.name_uz || null;
  } catch (error) {
    console.error('Error getting region name:', error);
    return null;
  }
}

/**
 * Получить название района по ID (с информацией о регионе)
 */
export async function getDistrictNameById(districtId: number | null | undefined): Promise<{ name: string; region_id: number | null } | null> {
  if (!districtId) return null;
  
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from('districts')
      .select('name_uz, region_id')
      .eq('id', districtId)
      .single();
    
    if (error || !data) return null;
    return { name: data.name_uz || null, region_id: data.region_id || null };
  } catch (error) {
    console.error('Error getting district name:', error);
    return null;
  }
}

/**
 * Получить название города (из параметра или из базы)
 */
export function getCityName(city: string | null | undefined): string | null {
  if (!city) return null;
  
  // Переводы городов
  const cityTranslations: Record<string, string> = {
    'Ташкент': 'Toshkent shahri',
    'Андижан': 'Andijon',
    'Наманган': 'Namangan',
    'Фергана': 'Fargʻona',
    'Самарканд': 'Samarqand',
    'Бухара': 'Buxoro',
    'Нукус': 'Nukus',
    'Карши': 'Qarshi',
    'Термез': 'Termiz',
    'Гулистан': 'Guliston',
    'Джизак': 'Jizzax',
    'Навои': 'Navoiy',
    'Ургенч': 'Urganch',
    'Коканд': 'Qoʻqon',
  };
  
  return cityTranslations[city] || city;
}

/**
 * Генерировать заголовок страницы каталога школ на основе фильтров
 */
export async function generateSchoolsListTitle(params: {
  region?: string;
  district?: string;
  city?: string;
  school_type?: string;
}): Promise<string> {
  const locationParts: string[] = [];
  
  // Город
  if (params.city) {
    const cityName = getCityName(params.city);
    if (cityName) {
      locationParts.push(cityName);
    }
  }
  
  // Если выбран регион, но не выбран город и не выбран район
  if (params.region && !params.city && !params.district) {
    const regionId = parseInt(params.region, 10);
    if (!isNaN(regionId)) {
      const regionName = await getRegionNameById(regionId);
      if (regionName) {
        // Если регион - это Ташкент, используем "Toshkent shahri"
        if (regionName.toLowerCase().includes('toshkent') || regionName.toLowerCase().includes('ташкент')) {
          locationParts.push('Toshkent shahri');
        } else {
          // Для других регионов используем название региона
          locationParts.push(regionName);
        }
      }
    }
  }
  
  // Районы (поддержка до 4 районов)
  const districtNames: string[] = [];
  if (params.district) {
    const districtIds = params.district.split(',').filter(Boolean).slice(0, 4); // Лимит 4 района
    if (districtIds.length > 0) {
      let firstRegionId: number | null = null;

      // Получаем названия всех выбранных районов
      for (const districtIdStr of districtIds) {
        const districtId = parseInt(districtIdStr, 10);
        if (!isNaN(districtId)) {
          const districtData = await getDistrictNameById(districtId);
          if (districtData && districtData.name) {
            districtNames.push(districtData.name);
            // Сохраняем region_id первого района для определения города
            if (firstRegionId === null && districtData.region_id) {
              firstRegionId = districtData.region_id;
            }
          }
        }
      }
      
      // Если город не указан, но есть районы, получаем регион для города
      if (!params.city && firstRegionId !== null && districtNames.length > 0) {
        const regionName = await getRegionNameById(firstRegionId);
        if (regionName) {
          // Если регион - это Ташкент, используем "Toshkent shahri"
          if (regionName.toLowerCase().includes('toshkent') || regionName.toLowerCase().includes('ташкент')) {
            locationParts.push('Toshkent shahri');
          } else {
            // Для других регионов используем название региона
            locationParts.push(regionName);
          }
        }
      }
    }
  }
  
  // Тип школы
  const schoolTypeLabel = params.school_type ? schoolTypeLabels[params.school_type] : null;
  
  // Формируем заголовок
  // Если нет фильтров по локации (нет region, city, district) - это весь Узбекистан
  if (locationParts.length === 0 && districtNames.length === 0 && !params.region && !params.city && !params.district) {
    if (schoolTypeLabel) {
      return `O'zbekiston hududida joylashgan ${schoolTypeLabel} maktablar ro'yxati`;
    }
    return `O'zbekiston hududida joylashgan maktablar ro'yxati`;
  }
  
  // Формат: "Toshkent shahri, Yangihayot tumani hududida joylashgan xususiy maktablar ro'yxati"
  if (locationParts.length > 0 && districtNames.length > 0) {
    // Есть город (или регион) и районы
    const cityPart = locationParts[0];
    const districtPart = districtNames.join(', '); // Объединяем все районы через запятую
    return `${cityPart}, ${districtPart} hududida joylashgan ${schoolTypeLabel || 'maktablar'} ro'yxati`;
  }
  
  // Если только районы без города (маловероятно, но обрабатываем)
  if (locationParts.length === 0 && districtNames.length > 0) {
    const districtPart = districtNames.join(', ');
    return `${districtPart} hududida joylashgan ${schoolTypeLabel || 'maktablar'} ro'yxati`;
  }
  
  // Если только город или регион (без районов)
  if (locationParts.length === 1 && (params.city || params.region) && !params.district && districtNames.length === 0) {
    return `${locationParts[0]} hududida joylashgan ${schoolTypeLabel || 'maktablar'} ro'yxati`;
  }
  
  // Если только тип школы (но есть какие-то фильтры, которые не попали в locationParts)
  if (schoolTypeLabel && locationParts.length === 0 && districtNames.length === 0 && (params.region || params.city || params.district)) {
    return `${schoolTypeLabel} maktablar ro'yxati`;
  }
  
  // Общий формат
  return `${locationParts.join(', ')} ${schoolTypeLabel || 'maktablar'} ro'yxati`;
}

/**
 * Генерировать заголовок страницы списка школ в формате:
 * "[Region], [District1], [District2] tumani hududidagi maktablar ro'yxati"
 */
export async function generateSchoolsListPageTitle(params: {
  region?: string;
  district?: string;
}): Promise<string> {
  // Если нет фильтров, возвращаем общий заголовок
  if (!params.region && !params.district) {
    return "Maktablar katalogi";
  }

  let regionName: string | null = null;
  const districtNames: string[] = [];

  // Получаем название региона, если выбран
  if (params.region) {
    const regionId = parseInt(params.region, 10);
    if (!isNaN(regionId)) {
      const region = await getRegionById(regionId);
      if (region) {
        regionName = region.name_uz;
      }
    }
  }

  // Получаем названия районов (до 4 штук)
  // Если регион не выбран, но есть районы, получаем регион из первого района
  if (params.district) {
    const districtIds = params.district.split(',').filter(Boolean).slice(0, 4);
    let firstDistrictRegionId: number | null = null;
    
    for (const districtIdStr of districtIds) {
      const districtId = parseInt(districtIdStr, 10);
      if (!isNaN(districtId)) {
        const district = await getDistrictById(districtId);
        if (district) {
          districtNames.push(district.name_uz);
          // Сохраняем region_id первого района, если регион еще не получен
          if (!regionName && firstDistrictRegionId === null && district.region_id) {
            firstDistrictRegionId = district.region_id;
          }
        }
      }
    }

    // Если регион не был выбран, но есть районы, получаем регион из первого района
    if (!regionName && firstDistrictRegionId !== null) {
      const region = await getRegionById(firstDistrictRegionId);
      if (region) {
        regionName = region.name_uz;
      }
    }
  }

  // Если есть регион и районы
  if (regionName && districtNames.length > 0) {
    const districtsPart = districtNames.join(', ');
    return `${regionName}, ${districtsPart} hududidagi maktablar ro'yxati`;
  }

  // Если есть только регион
  if (regionName && districtNames.length === 0) {
    return `${regionName} hududidagi maktablar ro'yxati`;
  }

  // Если есть только районы без региона (маловероятно, но обрабатываем)
  if (!regionName && districtNames.length > 0) {
    const districtsPart = districtNames.join(', ');
    return `${districtsPart} hududidagi maktablar ro'yxati`;
  }

  // Fallback
  return "Maktablar katalogi";
}

/**
 * Генерировать описание страницы каталога школ
 */
export async function generateSchoolsListDescription(params: {
  region?: string;
  district?: string;
  city?: string;
  school_type?: string;
}): Promise<string> {
  const title = await generateSchoolsListTitle(params);
  
  return `Farzandingiz uchun ${title.toLowerCase()}. O'zingizga mos parametrlar va ishonchli reyting bo'yicha eng yaxshi maktabni tanlang.`;
}

