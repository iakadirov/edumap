'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SchoolFiltersProps {
  districts: string[];
  cities: string[];
  initialFilters?: {
    district?: string;
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string;
    curriculum?: string;
  };
  onFiltersChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  district?: string;
  city?: string;
  school_type?: string;
  price_range?: [number, number];
  language?: string[]; // Изменено на массив для множественного выбора
  curriculum?: string[];
}

/**
 * Компонент фильтров для поиска школ
 * 
 * Features:
 * - Фильтры: район, город, тип школы, цена, язык, curriculum
 * - Использует URL search params для состояния
 * - Кнопка "Сбросить фильтры"
 */
export function SchoolFilters({ districts, cities, initialFilters, onFiltersChange }: SchoolFiltersProps) {
  const router = useRouter();

  // Инициализируем фильтры из пропсов (передаются из server component)
  const [filters, setFilters] = useState<FilterValues>(() => {
    try {
      const init = initialFilters || {};
      return {
        district: init.district || undefined,
        city: init.city || undefined,
        school_type: init.school_type || undefined,
        price_range: init.price_min && init.price_max
          ? [Number(init.price_min), Number(init.price_max)]
          : [0, 50000000], // Диапазон по умолчанию: 0 - 50 млн
        language: init.language ? init.language.split(',').filter(Boolean) : [],
        curriculum: init.curriculum ? init.curriculum.split(',').filter(Boolean) : [],
      };
    } catch (error) {
      // Fallback на значения по умолчанию при ошибке
      return {
        district: undefined,
        city: undefined,
        school_type: undefined,
        price_range: [0, 50000000],
        language: [],
        curriculum: [],
      };
    }
  });

  // Типы школ
  const schoolTypes = [
    { value: 'private', label: 'Xususiy' },
    { value: 'state', label: 'Davlat' },
    { value: 'international', label: 'Xalqaro' },
  ];

  // Языки
  const languages = [
    { value: 'russian', label: 'Rus' },
    { value: 'uzbek', label: 'Oʻzbek' },
    { value: 'english', label: 'Ingliz' },
  ];

  // Программы
  const curricula = [
    { value: 'national', label: 'Milliy' },
    { value: 'cambridge', label: 'Cambridge' },
    { value: 'ib', label: 'IB (International Baccalaureate)' },
  ];

  // Обновление фильтров и URL
  const updateFilters = (newFilters: Partial<FilterValues>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Обновляем URL
    const params = new URLSearchParams();
    if (updated.district) params.set('district', updated.district);
    if (updated.city) params.set('city', updated.city);
    if (updated.school_type) params.set('school_type', updated.school_type);
    if (updated.price_range && updated.price_range[0] > 0) {
      params.set('price_min', updated.price_range[0].toString());
    }
    if (updated.price_range && updated.price_range[1] < 50000000) {
      params.set('price_max', updated.price_range[1].toString());
    }
    if (updated.language && updated.language.length > 0) {
      params.set('language', updated.language.join(','));
    }
    if (updated.curriculum && updated.curriculum.length > 0) {
      params.set('curriculum', updated.curriculum.join(','));
    }

    const newUrl = params.toString() ? `/schools?${params.toString()}` : '/schools';
    router.push(newUrl, { scroll: false });
    
    // Вызываем callback
    onFiltersChange?.(updated);
  };

  // Сброс всех фильтров
  const resetFilters = () => {
    setFilters({
      district: undefined,
      city: undefined,
      school_type: undefined,
      price_range: [0, 50000000],
        language: [],
        curriculum: [],
    });
    try {
      router.push('/schools');
      onFiltersChange?.({});
    } catch (error) {
      console.error('Ошибка сброса фильтров:', error);
    }
  };

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters =
    filters.district ||
    filters.city ||
    filters.school_type ||
    (filters.language && filters.language.length > 0) ||
    (filters.curriculum && filters.curriculum.length > 0) ||
    (filters.price_range && (filters.price_range[0] > 0 || filters.price_range[1] < 50000000));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Qidiruv filtrlari</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Tozalash
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Район */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tuman</label>
          <Select
            value={filters.district ? filters.district : 'all'}
            onValueChange={(value) => updateFilters({ district: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Barcha tumanlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha tumanlar</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Город */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Shahar</label>
          <Select
            value={filters.city ? filters.city : 'all'}
            onValueChange={(value) => updateFilters({ city: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Barcha shaharlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha shaharlar</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Тип школы */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Maktab turi</label>
          <Select
            value={filters.school_type ? filters.school_type : 'all'}
            onValueChange={(value) => updateFilters({ school_type: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Barcha turlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha turlar</SelectItem>
              {schoolTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Диапазон цены */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Oyiga narx</label>
            <span className="text-sm text-muted-foreground">
              {filters.price_range?.[0]?.toLocaleString('ru-RU') || 0} -{' '}
              {filters.price_range?.[1]?.toLocaleString('ru-RU') || 50000000} soʻm
            </span>
          </div>
          <Slider
            value={filters.price_range || [0, 50000000]}
            onValueChange={(value) => updateFilters({ price_range: value as [number, number] })}
            max={50000000}
            min={0}
            step={100000}
            className="w-full"
          />
        </div>

        {/* Язык обучения */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Taʼlim tili</label>
          <div className="space-y-2">
            {languages.map((lang) => (
              <div key={lang.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${lang.value}`}
                  checked={filters.language?.includes(lang.value) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.language || [];
                    const updated = checked
                      ? [...current, lang.value]
                      : current.filter((l) => l !== lang.value);
                    updateFilters({ language: updated });
                  }}
                />
                <label
                  htmlFor={`language-${lang.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {lang.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Программа обучения */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Taʼlim dasturi</label>
          <div className="space-y-2">
            {curricula.map((curr) => (
              <div key={curr.value} className="flex items-center space-x-2">
                <Checkbox
                  id={curr.value}
                  checked={filters.curriculum?.includes(curr.value) || false}
                  onCheckedChange={(checked) => {
                    const current = filters.curriculum || [];
                    const updated = checked
                      ? [...current, curr.value]
                      : current.filter((c) => c !== curr.value);
                    updateFilters({ curriculum: updated });
                  }}
                />
                <label
                  htmlFor={curr.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {curr.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

