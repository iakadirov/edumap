/**
 * Переводы городов и районов на узбекский язык
 */

const cityTranslations: Record<string, string> = {
  'Ташкент': 'Toshkent',
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

const districtTranslations: Record<string, string> = {
  'Мирабадский': 'Mirobod',
  'Юнусабадский': 'Yunusobod',
  'Чиланзарский': 'Chilonzor',
  'Учтепинский': 'Uchtepa',
  'Шайхантахурский': 'Shayxontohur',
  'Яшнабадский': 'Yashnobod',
  'Центральный': 'Markaziy',
  'Алмазарский': 'Olmazor',
  'Сергелийский': 'Sergeli',
  'Бектемирский': 'Bektemir',
  'Мирзо-Улугбекский': 'Mirzo-Ulugʻbek',
};

export function translateCity(city: string | null): string {
  if (!city) return '-';
  return cityTranslations[city] || city;
}

export function translateDistrict(district: string | null): string {
  if (!district) return '';
  return districtTranslations[district] || district;
}

export function getCityDistrict(city: string | null, district: string | null): string {
  const translatedCity = translateCity(city);
  const translatedDistrict = translateDistrict(district);
  
  if (!translatedCity) return '-';
  if (translatedDistrict) {
    return `${translatedCity}, ${translatedDistrict}`;
  }
  return translatedCity;
}

