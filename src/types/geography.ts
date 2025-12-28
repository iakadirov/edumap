/**
 * Типы для географических данных (regions, districts)
 * Эти таблицы добавлены вручную и не включены в автогенерированные типы Supabase
 */

export interface Region {
  id: number;
  name_uz: string;
  name_ru: string | null;
  name_oz: string | null;
  code: string | null;
  country_code: string;
}

export interface District {
  id: number;
  name_uz: string;
  name_ru: string | null;
  name_oz: string | null;
  region_id: number;
  district_type: 'city' | 'district' | 'town' | null;
}

export interface DistrictWithCount extends District {
  count: number;
}

export interface RegionWithDistricts extends Region {
  districts: District[];
}

// Типы для API ответов
export interface DistrictApiResponse {
  id: string;
  name: string;
  name_uz: string;
  name_ru: string | null;
  count: number;
}

export interface RegionApiResponse {
  id: number;
  name: string;
  name_uz: string;
  name_ru: string | null;
}

// Типы для форм и компонентов
export interface RegionOption {
  value: string;
  label: string;
}

export interface DistrictOption {
  value: string;
  label: string;
  count?: number;
}
