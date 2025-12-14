'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DistrictsLoader } from './DistrictsLoader';
import { PriceRangeSlider } from './filters/PriceRangeSlider';
import { GradeSelect } from './filters/GradeSelect';
import { LanguageChips } from './filters/LanguageChips';
import { CurriculumChips } from './filters/CurriculumChips';
import { RatingRadio } from './filters/RatingRadio';
import { ServicesToggles } from './filters/ServicesToggles';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { translateDistrict } from '@/lib/utils/translations';

interface DistrictOption {
  id: string;
  name: string;
  name_uz: string;
  count?: number;
}

interface SchoolFiltersProps {
  cities: string[];
  initialFilters?: {
    district?: string; // comma-separated для множественного выбора
    city?: string;
    school_type?: string;
    price_min?: string;
    price_max?: string;
    language?: string; // comma-separated
    curriculum?: string; // comma-separated
    grade?: string;
    rating_min?: string;
    has_transport?: string;
    has_meals?: string;
    has_extended_day?: string;
  };
  onFiltersChange?: (filters: FilterValues) => void;
}

export interface FilterValues {
  districts?: string[]; // Массив ID районов
  city?: string;
  school_type?: string;
  price_range?: [number, number];
  language?: string[];
  curriculum?: string[];
  grade?: string;
  rating_min?: number;
  has_transport?: boolean;
  has_meals?: boolean;
  has_extended_day?: boolean;
}

/**
 * Обновленный компонент фильтров для поиска школ
 * 
 * Features:
 * - Новые компоненты фильтров с улучшенным UX
 * - Multi-select для районов с поиском
 * - Dual-handle price slider с USD/UZS
 * - Grade select с группировкой
 * - Language и Curriculum chips
 * - Rating radio со звездами
 * - Services toggles
 */
export function SchoolFilters({ cities, initialFilters, onFiltersChange }: SchoolFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Инициализируем фильтры из пропсов
  const [filters, setFilters] = useState<FilterValues>(() => {
    try {
      const init = initialFilters || {};
      
      // Парсим districts (может быть comma-separated string)
      const districtIds = init.district
        ? init.district.split(',').filter(Boolean)
        : [];

      // Определяем min/max цены из данных
      const DEFAULT_MIN = 0;
      const DEFAULT_MAX = 50000000;

      return {
        districts: districtIds.length > 0 ? districtIds : undefined,
        city: init.city || undefined,
        school_type: init.school_type || undefined,
        price_range: init.price_min || init.price_max
          ? [
              init.price_min ? Number(init.price_min) : DEFAULT_MIN,
              init.price_max ? Number(init.price_max) : DEFAULT_MAX,
            ]
          : [DEFAULT_MIN, DEFAULT_MAX],
        language: init.language ? init.language.split(',').filter(Boolean) : [],
        curriculum: init.curriculum ? init.curriculum.split(',').filter(Boolean) : [],
        grade: init.grade || undefined,
        rating_min: init.rating_min ? Number(init.rating_min) : undefined,
        has_transport: init.has_transport === 'true',
        has_meals: init.has_meals === 'true',
        has_extended_day: init.has_extended_day === 'true',
      };
    } catch (error) {
      console.error('Ошибка инициализации фильтров:', error);
      return {
        price_range: [0, 50000000],
        language: [],
        curriculum: [],
      };
    }
  });

  // Debounced обновление URL
  const updateURL = useDebouncedCallback((updatedFilters: FilterValues) => {
    // Берем текущие параметры из URL, чтобы сохранить другие фильтры (например, region)
    // Используем window.location.search для получения актуальных параметров
    const currentParams = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams(searchParams.toString());
    const params = new URLSearchParams(currentParams.toString());

    // Districts (multi-select)
    if (updatedFilters.districts && updatedFilters.districts.length > 0) {
      params.set('district', updatedFilters.districts.join(','));
    } else {
      // Удаляем параметр district, если районы не выбраны
      params.delete('district');
    }

    // City
    if (updatedFilters.city) {
      params.set('city', updatedFilters.city);
    } else {
      params.delete('city');
    }

    // School type
    if (updatedFilters.school_type) {
      params.set('school_type', updatedFilters.school_type);
    } else {
      params.delete('school_type');
    }

    // Price range
    if (updatedFilters.price_range) {
      const [min, max] = updatedFilters.price_range;
      const DEFAULT_MAX = 50000000;
      if (min > 0) {
        params.set('price_min', min.toString());
      }
      if (max < DEFAULT_MAX) {
        params.set('price_max', max.toString());
      }
    }

    // Language (comma-separated)
    if (updatedFilters.language && updatedFilters.language.length > 0) {
      params.set('language', updatedFilters.language.join(','));
    } else {
      params.delete('language');
    }

    // Curriculum (comma-separated)
    if (updatedFilters.curriculum && updatedFilters.curriculum.length > 0) {
      params.set('curriculum', updatedFilters.curriculum.join(','));
    } else {
      params.delete('curriculum');
    }

    // Grade
    if (updatedFilters.grade) {
      params.set('grade', updatedFilters.grade);
    } else {
      params.delete('grade');
    }

    // Rating
    if (updatedFilters.rating_min) {
      params.set('rating_min', updatedFilters.rating_min.toString());
    } else {
      params.delete('rating_min');
    }

    // Services
    if (updatedFilters.has_transport) {
      params.set('has_transport', 'true');
    } else {
      params.delete('has_transport');
    }
    if (updatedFilters.has_meals) {
      params.set('has_meals', 'true');
    } else {
      params.delete('has_meals');
    }
    if (updatedFilters.has_extended_day) {
      params.set('has_extended_day', 'true');
    } else {
      params.delete('has_extended_day');
    }

    const newUrl = params.toString() ? `/schools/list?${params.toString()}` : '/schools/list';
    router.push(newUrl, { scroll: false });
  }, 300);

  // Обновление фильтров
  const updateFilters = useCallback((newFilters: Partial<FilterValues>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      updateURL(updated);
      onFiltersChange?.(updated);
      return updated;
    });
  }, [updateURL, onFiltersChange]);

  // Сброс всех фильтров
  const resetFilters = () => {
    const reset: FilterValues = {
      price_range: [0, 50000000],
      language: [],
      curriculum: [],
    };
    setFilters(reset);
    router.push('/schools/list');
    onFiltersChange?.(reset);
  };

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters =
    (filters.districts && filters.districts.length > 0) ||
    filters.city ||
    filters.school_type ||
    (filters.language && filters.language.length > 0) ||
    (filters.curriculum && filters.curriculum.length > 0) ||
    filters.grade ||
    filters.rating_min ||
    filters.has_transport ||
    filters.has_meals ||
    filters.has_extended_day ||
    (filters.price_range && (filters.price_range[0] > 0 || filters.price_range[1] < 50000000));

  // Типы школ
  const schoolTypes = [
    { value: 'private', label: 'Xususiy' },
    { value: 'state', label: 'Davlat' },
    { value: 'international', label: 'Xalqaro' },
  ];

  // Districts теперь загружаются реактивно через DistrictsLoader

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
        {/* ГРУППА 1: ОСНОВНЫЕ ФИЛЬТРЫ (всегда видны) */}
        
        {/* Район - Multi-select (загружается реактивно по области) */}
        <DistrictsLoader
          selected={filters.districts || []}
          onSelectionChange={(selected) => updateFilters({ districts: selected.length > 0 ? selected : undefined })}
        />

        {/* Цена - Range Slider */}
        {filters.price_range && (
          <PriceRangeSlider
            value={filters.price_range}
            min={0}
            max={50000000}
            onValueChange={(value) => updateFilters({ price_range: value })}
          />
        )}

        {/* Класс поступления */}
        <GradeSelect
          value={filters.grade}
          onValueChange={(value) => updateFilters({ grade: value })}
        />

        {/* Язык обучения - Chips */}
        <LanguageChips
          selected={filters.language || []}
          onSelectionChange={(selected) => updateFilters({ language: selected.length > 0 ? selected : [] })}
        />

        <Separator />

        {/* ГРУППА 2: ПРОГРАММА И КАЧЕСТВО */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Dastur va sifat</Label>
          </div>

          {/* Программа - Chips */}
          <CurriculumChips
            selected={filters.curriculum || []}
            onSelectionChange={(selected) => updateFilters({ curriculum: selected.length > 0 ? selected : [] })}
          />

          {/* Рейтинг - Radio */}
          <RatingRadio
            value={filters.rating_min}
            onValueChange={(value) => updateFilters({ rating_min: value })}
          />

          {/* Тип школы */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Maktab turi</Label>
            <Select
              value={filters.school_type || 'all'}
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
        </div>

        <Separator />

        {/* ГРУППА 3: УСЛУГИ */}
        <ServicesToggles
          transport={filters.has_transport || false}
          meals={filters.has_meals || false}
          extendedDay={filters.has_extended_day || false}
          onTransportChange={(value) => updateFilters({ has_transport: value || undefined })}
          onMealsChange={(value) => updateFilters({ has_meals: value || undefined })}
          onExtendedDayChange={(value) => updateFilters({ has_extended_day: value || undefined })}
        />
      </CardContent>
    </Card>
  );
}
