'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MapPointBold,
  AltArrowDownLinear,
} from '@solar-icons/react-perf';
import { useRegion, type Region } from '@/contexts/RegionContext';
import { cn } from '@/lib/utils';

/**
 * Компонент выбора области в Header
 * 
 * Features:
 * - Отображение выбранной области
 * - Модальное окно для выбора области
 * - Сохранение в localStorage через RegionContext
 */
const REGION_CHOICE_MADE_KEY = 'edumap_region_choice_made';

interface RegionWithCount extends Region {
  count?: number;
}

export function RegionSelector() {
  const { selectedRegion, setSelectedRegion, isLoading } = useRegion();
  const [regions, setRegions] = useState<RegionWithCount[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Загружаем список регионов и количество школ
  useEffect(() => {
    async function loadRegions() {
      try {
        const [regionsResponse, countsResponse] = await Promise.all([
          fetch('/data/regions.json'),
          fetch('/api/regions/counts').catch(() => null), // Ловим ошибки, но не прерываем загрузку
        ]);

        const regionsData = await regionsResponse.json();
        
        // Если счетчики не загрузились, просто используем регионы без счетчиков
        if (!countsResponse || !countsResponse.ok) {
          setRegions(regionsData);
          setIsLoadingCounts(false);
          return;
        }

        const countsData = await countsResponse.json();

        // Проверяем, что данные валидны
        if (!countsData || typeof countsData !== 'object') {
          setRegions(regionsData);
          setIsLoadingCounts(false);
          return;
        }

        // Объединяем регионы с количеством школ
        const regionsWithCounts: RegionWithCount[] = regionsData.map((region: Region) => ({
          ...region,
          count: countsData.byRegion && typeof countsData.byRegion === 'object' 
            ? (countsData.byRegion[region.id] || 0)
            : 0,
        }));

        setRegions(regionsWithCounts);
        setTotalCount(typeof countsData.total === 'number' ? countsData.total : 0);
        setIsLoadingCounts(false);
      } catch (error) {
        console.error('Error loading regions:', error);
        // В случае ошибки просто загружаем регионы без счетчиков
        try {
          const response = await fetch('/data/regions.json');
          const data = await response.json();
          setRegions(data);
        } catch (fetchError) {
          console.error('Error fetching regions.json:', fetchError);
        }
        setIsLoadingCounts(false);
      }
    }
    loadRegions();
  }, []);

  // Показываем диалог только при первой загрузке, если выбор еще не был сделан
  useEffect(() => {
    if (!isLoading) {
      const choiceMade = localStorage.getItem(REGION_CHOICE_MADE_KEY) === 'true';
      // Открываем модальное окно только если выбор еще не был сделан
      if (!choiceMade) {
        setIsDialogOpen(true);
      }
    }
  }, [isLoading]);

  const handleSelectRegion = (region: Region | null) => {
    setSelectedRegion(region);
    // Отмечаем, что выбор был сделан (даже если выбран "O'zbekiston" / null)
    localStorage.setItem(REGION_CHOICE_MADE_KEY, 'true');
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <MapPointBold className="h-4 w-4" />
        <span>Yuklanmoqda...</span>
      </Button>
    );
  }

  const displayName = selectedRegion?.name_uz || "O'zbekiston";

  return (
    <>
      {/* Кнопка для открытия модального окна */}
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        data-region-selector
        className={cn(
          'gap-1 h-11 px-4 py-3 rounded-[12px]',
          'bg-gray-100 hover:bg-gray-200',
          'border-none',
          !selectedRegion && 'text-muted-foreground'
        )}
      >
        <MapPointBold className="h-5 w-5 text-slate-600" />
        <span className="text-base font-medium text-slate-600">
          {displayName}
        </span>
        <AltArrowDownLinear className="h-3 w-3 text-slate-600" />
      </Button>

      {/* Модальное окно выбора области */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!w-[calc(100vw-2rem)] !max-w-[1020px] sm:!w-[1020px] px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Viloyatingizni tanlang</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Qaysi viloyatda joylashgan maktablarni ko'rmoqchisiz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto py-2 sm:py-4">
            {/* Вариант "O'zbekiston" (все регионы) */}
            <Button
              variant="outline"
              className={cn(
                'h-auto p-3 sm:p-4 flex items-center justify-between hover:bg-accent transition-colors',
                !selectedRegion && 'ring-2 ring-primary bg-accent'
              )}
              onClick={() => handleSelectRegion(null)}
            >
              <div className="flex items-center">
                <MapPointBold className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-left ml-2">O'zbekiston</span>
              </div>
              {!isLoadingCounts && totalCount !== null && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({totalCount})
                </span>
              )}
            </Button>

            {/* Список регионов */}
            {regions.map((region) => (
              <Button
                key={region.id}
                variant="outline"
                className={cn(
                  'h-auto p-3 sm:p-4 flex items-center justify-between hover:bg-accent transition-colors',
                  selectedRegion?.id === region.id && 'ring-2 ring-primary bg-accent'
                )}
                onClick={() => handleSelectRegion(region)}
              >
                <div className="flex items-center">
                  <MapPointBold className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-semibold text-left ml-2">{region.name_uz}</span>
                </div>
                {!isLoadingCounts && region.count !== undefined && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({region.count})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

