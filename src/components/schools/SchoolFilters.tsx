'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  onFiltersChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  district?: string;
  city?: string;
  school_type?: string;
  price_range?: [number, number];
  language?: string;
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
export function SchoolFilters({ districts, cities, onFiltersChange }: SchoolFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Инициализируем фильтры из URL
  const [filters, setFilters] = useState<FilterValues>({
    district: searchParams.get('district') || undefined,
    city: searchParams.get('city') || undefined,
    school_type: searchParams.get('school_type') || undefined,
    price_range: searchParams.get('price_min') && searchParams.get('price_max')
      ? [Number(searchParams.get('price_min')), Number(searchParams.get('price_max'))]
      : [0, 50000000], // Диапазон по умолчанию: 0 - 50 млн
    language: searchParams.get('language') || undefined,
    curriculum: searchParams.get('curriculum')?.split(',') || [],
  });

  // Типы школ
  const schoolTypes = [
    { value: 'private', label: 'Частная' },
    { value: 'state', label: 'Государственная' },
    { value: 'international', label: 'Международная' },
  ];

  // Языки
  const languages = [
    { value: 'russian', label: 'Русский' },
    { value: 'uzbek', label: 'Узбекский' },
    { value: 'english', label: 'Английский' },
  ];

  // Программы
  const curricula = [
    { value: 'national', label: 'Национальная' },
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
    if (updated.language) params.set('language', updated.language);
    if (updated.curriculum && updated.curriculum.length > 0) {
      params.set('curriculum', updated.curriculum.join(','));
    }

    router.push(`/schools?${params.toString()}`, { scroll: false });
    
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
      language: undefined,
      curriculum: [],
    });
    router.push('/schools', { scroll: false });
    onFiltersChange?.({});
  };

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters =
    filters.district ||
    filters.city ||
    filters.school_type ||
    filters.language ||
    (filters.curriculum && filters.curriculum.length > 0) ||
    (filters.price_range && (filters.price_range[0] > 0 || filters.price_range[1] < 50000000));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Фильтры поиска</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Сбросить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Район */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Район</label>
          <Select
            value={filters.district || ''}
            onValueChange={(value) => updateFilters({ district: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все районы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все районы</SelectItem>
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
          <label className="text-sm font-medium">Город</label>
          <Select
            value={filters.city || ''}
            onValueChange={(value) => updateFilters({ city: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все города" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все города</SelectItem>
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
          <label className="text-sm font-medium">Тип школы</label>
          <Select
            value={filters.school_type || ''}
            onValueChange={(value) => updateFilters({ school_type: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все типы</SelectItem>
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
            <label className="text-sm font-medium">Стоимость в месяц</label>
            <span className="text-sm text-muted-foreground">
              {filters.price_range?.[0]?.toLocaleString('ru-RU') || 0} -{' '}
              {filters.price_range?.[1]?.toLocaleString('ru-RU') || 50000000} сум
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Язык обучения</label>
          <Select
            value={filters.language || ''}
            onValueChange={(value) => updateFilters({ language: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Все языки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все языки</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Программа обучения */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Программа обучения</label>
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

