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
import { AltArrowDownLinear } from '@solar-icons/react-perf';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const defaultLanguages = [
  { id: 'uzbek', label: 'O\'zbek' },
  { id: 'russian', label: 'Русский' },
  { id: 'english', label: 'English' },
];

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
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [additionalFiltersOpen, setAdditionalFiltersOpen] = useState(false);

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
      const DEFAULT_MAX = 20000000; // 20 млн сумов

      return {
        districts: districtIds.length > 0 ? districtIds : undefined,
        city: init.city || undefined,
        school_type: init.school_type || undefined,
        price_range: init.price_min || init.price_max
          ? [
              init.price_min ? Number(init.price_min) : DEFAULT_MIN,
              init.price_max ? Number(init.price_max) : DEFAULT_MAX,
            ]
          : undefined, // Если цена не выбрана - не применяем фильтр
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
        price_range: undefined,
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
      const DEFAULT_MAX = 20000000; // 20 млн сумов
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
      price_range: undefined,
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
    (filters.price_range && filters.price_range[1] > 0 && filters.price_range[1] < 20000000);

  // Типы школ
  const schoolTypes = [
    { value: 'private', label: 'Xususiy' },
    { value: 'state', label: 'Davlat' },
    { value: 'international', label: 'Xalqaro' },
  ];

  // Districts теперь загружаются реактивно через DistrictsLoader

  return (
    <div className="w-full flex flex-col gap-4" style={{ width: '1092px' }}>
      {/* Заголовок и кнопка сброса */}
      <div className="flex items-center justify-between w-full h-5">
        <h3 className="text-base font-semibold text-black" style={{ width: '108px', height: '20px' }}>
          Qidiruv filtrlari
        </h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={resetFilters} 
            className="flex items-center gap-1 h-5 p-0 text-base font-medium text-black hover:bg-transparent cursor-pointer"
            style={{ width: '131px', height: '20px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.5L5.5 2.5M5.5 2.5L8.5 5.5M5.5 2.5V11.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 10.5L10.5 13.5M10.5 13.5L7.5 10.5M10.5 13.5V4.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Filtrni tozalash</span>
          </Button>
        )}
      </div>

      {/* Белая карточка с фильтрами */}
      <div 
        className="bg-white rounded-[20px] p-5 flex flex-row items-end gap-5"
        style={{ 
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.15)',
          width: '1092px',
          height: '116px'
        }}
      >
        {/* Район - Multi-select */}
        <div className="flex flex-col gap-2 flex-1" style={{ width: '297.33px', height: '76px' }}>
          <label className="text-base font-normal text-black" style={{ height: '20px' }}>
            Tumanni tanlang
          </label>
          <DistrictsLoader
            selected={filters.districts || []}
            onSelectionChange={(selected) => updateFilters({ districts: selected.length > 0 ? selected : undefined })}
            compact
          />
        </div>

        {/* Язык обучения */}
        <div className="flex flex-col gap-2 flex-1" style={{ width: '297.33px', height: '76px' }}>
          <label className="text-base font-normal text-black" style={{ height: '20px' }}>
            Ta'lim tilini tanlang
          </label>
          <div className="flex flex-row items-center gap-3" style={{ height: '48px' }}>
            {defaultLanguages.map((lang) => {
              const isSelected = filters.language?.includes(lang.id) || false;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    const current = filters.language || [];
                    const updated = isSelected
                      ? current.filter((id) => id !== lang.id)
                      : [...current, lang.id];
                    updateFilters({ language: updated.length > 0 ? updated : [] });
                  }}
                  className="flex items-center justify-center px-4 py-3.5 flex-1 h-12 rounded-xl transition-colors cursor-pointer"
                  style={{
                    background: isSelected ? '#0077ff' : '#F7FCFE',
                    border: isSelected ? '1px solid #0077ff' : '1px solid #DDEBF0',
                    height: '48px',
                    color: isSelected ? '#ffffff' : '#000000'
                  }}
                >
                  <span className="text-base font-normal">
                    {lang.id === 'uzbek' ? 'O\'zbek' : lang.id === 'russian' ? 'Русский' : 'English'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Цена */}
        <div className="flex flex-col gap-2 flex-1 relative" style={{ width: '297.33px', height: '76px' }}>
          <label className="text-base font-normal text-black" style={{ height: '20px' }}>
            Maktab narxini belgilang
          </label>
          <div className="flex items-center gap-2 relative" style={{ height: '48px' }}>
            <DropdownMenu open={priceDropdownOpen} onOpenChange={setPriceDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div 
                  className="flex items-center px-4 py-3.5 gap-2.5 flex-1 h-12 rounded-xl cursor-pointer"
                  style={{
                    background: '#F7FCFE',
                    border: '1px solid #DDEBF0',
                    height: '48px'
                  }}
                >
                  <span className="text-base font-normal text-black">
                    {filters.price_range?.[1] && filters.price_range[1] > 0
                      ? `${Math.round(filters.price_range[1] / 1000000)} 000 000 so'mgacha`
                      : 'Narxni tanlang'}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[297.33px] p-4 bg-white border border-gray-200 rounded-b-xl shadow-lg"
                align="start"
                side="bottom"
                sideOffset={0}
                style={{
                  borderTop: 'none',
                  borderTopLeftRadius: '0',
                  borderTopRightRadius: '0',
                  marginTop: '-1px',
                }}
              >
                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-700">
                    Maksimal narx: {filters.price_range?.[1] ? `${(filters.price_range[1] / 1000000).toFixed(1)} млн so'm` : '0 so\'m'}
                  </div>
                  <div className="px-2">
                    <Slider
                      value={[filters.price_range?.[1] || 0]}
                      onValueChange={(value) => {
                        const newRange: [number, number] = [0, value[0]];
                        updateFilters({ price_range: newRange });
                      }}
                      min={0}
                      max={20000000}
                      step={500000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 px-2">
                    <span>0 so'm</span>
                    <span>20 млн so'm</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Разделитель */}
            <div className="w-px h-8 bg-gray-300" />
            
            {/* Кнопка Yana с дополнительными фильтрами */}
            <DropdownMenu open={additionalFiltersOpen} onOpenChange={setAdditionalFiltersOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center px-4 py-3.5 gap-1 h-12 rounded-xl cursor-pointer"
                  style={{
                    background: '#F7FCFE',
                    border: '1px solid #DDEBF0',
                    width: '100px',
                    height: '48px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.33 9.33L6.67 6.67M6.67 6.67L9.33 4.33M6.67 6.67V13.33" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.67 6.67L9.33 9.33M9.33 9.33L6.67 11.67M9.33 9.33V2.67" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.67 11.33L5.33 8.67M5.33 8.67L8 6M5.33 8.67V15.33" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.33 4.67L10.67 7.33M10.67 7.33L8 10M10.67 7.33V0.67" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-base font-normal text-black">Yana</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[400px] p-6 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[600px] overflow-y-auto"
                align="end"
                side="bottom"
                sideOffset={8}
              >
                <div className="space-y-6">
                  {/* Программа обучения */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-3 block">Dastur</label>
                    <CurriculumChips
                      selected={filters.curriculum || []}
                      onSelectionChange={(selected) => updateFilters({ curriculum: selected.length > 0 ? selected : [] })}
                      className="space-y-0"
                    />
                  </div>

                  {/* Рейтинг */}
                  <div>
                    <RatingRadio
                      value={filters.rating_min}
                      onValueChange={(value) => updateFilters({ rating_min: value })}
                    />
                  </div>

                  {/* Услуги */}
                  <div>
                    <ServicesToggles
                      transport={filters.has_transport || false}
                      meals={filters.has_meals || false}
                      extendedDay={filters.has_extended_day || false}
                      onTransportChange={(value) => updateFilters({ has_transport: value || undefined })}
                      onMealsChange={(value) => updateFilters({ has_meals: value || undefined })}
                      onExtendedDayChange={(value) => updateFilters({ has_extended_day: value || undefined })}
                      className="space-y-0"
                    />
                  </div>

                  {/* Класс поступления */}
                  <div>
                    <GradeSelect
                      value={filters.grade}
                      onValueChange={(value) => updateFilters({ grade: value })}
                    />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
