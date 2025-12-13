/**
 * Утилиты для работы с данными областей и районов
 * Использует данные из репозитория uzbekistan-regions-data
 */

export interface Region {
  id: number;
  soato_id: number;
  name_uz: string;
  name_oz: string;
  name_ru: string;
}

export interface District {
  id: number;
  region_id: number;
  soato_id: number;
  name_uz: string;
  name_oz: string;
  name_ru: string;
}

let regionsCache: Region[] | null = null;
let districtsCache: District[] | null = null;

/**
 * Загрузить список областей
 */
export async function loadRegions(): Promise<Region[]> {
  if (regionsCache) {
    return regionsCache;
  }

  try {
    const response = await fetch('/data/regions.json');
    const data = await response.json();
    regionsCache = data;
    return data;
  } catch (error) {
    console.error('Error loading regions:', error);
    return [];
  }
}

/**
 * Загрузить список районов
 */
export async function loadDistricts(): Promise<District[]> {
  if (districtsCache) {
    return districtsCache;
  }

  try {
    const response = await fetch('/data/districts.json');
    const data = await response.json();
    districtsCache = data;
    return data;
  } catch (error) {
    console.error('Error loading districts:', error);
    return [];
  }
}

/**
 * Получить районы для выбранной области
 */
export async function getDistrictsByRegion(regionId: number | null): Promise<District[]> {
  const districts = await loadDistricts();
  
  if (regionId === null) {
    // Если область не выбрана, возвращаем все районы
    return districts;
  }

  return districts.filter(d => d.region_id === regionId);
}

/**
 * Найти область по названию (name_uz или name_ru)
 */
export async function findRegionByName(name: string): Promise<Region | null> {
  const regions = await loadRegions();
  const lowerName = name.toLowerCase().trim();
  
  return regions.find(r => 
    r.name_uz.toLowerCase() === lowerName ||
    r.name_ru.toLowerCase() === lowerName ||
    r.name_oz.toLowerCase() === lowerName
  ) || null;
}

/**
 * Найти район по названию (name_uz или name_ru)
 */
export async function findDistrictByName(name: string): Promise<District | null> {
  const districts = await loadDistricts();
  const lowerName = name.toLowerCase().trim();
  
  return districts.find(d => 
    d.name_uz.toLowerCase() === lowerName ||
    d.name_ru.toLowerCase() === lowerName ||
    d.name_oz.toLowerCase() === lowerName
  ) || null;
}

/**
 * Получить область по ID
 */
export async function getRegionById(id: number): Promise<Region | null> {
  const regions = await loadRegions();
  return regions.find(r => r.id === id) || null;
}

