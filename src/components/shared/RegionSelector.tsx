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
import { MapPin } from 'lucide-react';
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

export function RegionSelector() {
  const { selectedRegion, setSelectedRegion, isLoading } = useRegion();
  const [regions, setRegions] = useState<Region[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Загружаем список регионов
  useEffect(() => {
    async function loadRegions() {
      try {
        const response = await fetch('/data/regions.json');
        const data = await response.json();
        setRegions(data);
      } catch (error) {
        console.error('Error loading regions:', error);
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
        <MapPin className="h-4 w-4" />
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
        className={cn(
          'gap-2 h-12 px-4 rounded-2xl',
          'bg-[#F3F6F8] hover:bg-[#E8EDF1]',
          'border-none',
          !selectedRegion && 'text-muted-foreground'
        )}
      >
        <MapPin className="h-6 w-6" />
        <span className="text-[17px] font-medium leading-[22px] text-[#1A2438]">
          {displayName}
        </span>
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
                'h-auto p-3 sm:p-4 flex items-center justify-start hover:bg-accent transition-colors',
                !selectedRegion && 'ring-2 ring-primary bg-accent'
              )}
              onClick={() => handleSelectRegion(null)}
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-left ml-2">O'zbekiston</span>
            </Button>

            {/* Список регионов */}
            {regions.map((region) => (
              <Button
                key={region.id}
                variant="outline"
                className={cn(
                  'h-auto p-3 sm:p-4 flex items-center justify-start hover:bg-accent transition-colors',
                  selectedRegion?.id === region.id && 'ring-2 ring-primary bg-accent'
                )}
                onClick={() => handleSelectRegion(region)}
              >
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-left ml-2">{region.name_uz}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

