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

  // Показываем диалог при первой загрузке, если область не выбрана
  useEffect(() => {
    if (!isLoading && !selectedRegion) {
      setIsDialogOpen(true);
    }
  }, [isLoading, selectedRegion]);

  const handleSelectRegion = (region: Region | null) => {
    setSelectedRegion(region);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Viloyatingizni tanlang</DialogTitle>
            <DialogDescription>
              Qaysi viloyatda joylashgan maktablarni ko'rmoqchisiz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto py-4">
            {/* Вариант "O'zbekiston" (все регионы) */}
            <Button
              variant="outline"
              className={cn(
                'h-auto p-4 flex flex-col items-start hover:bg-accent transition-colors',
                !selectedRegion && 'ring-2 ring-primary bg-accent'
              )}
              onClick={() => handleSelectRegion(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold text-left">O'zbekiston</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                Barcha viloyatlar
              </span>
            </Button>

            {/* Список регионов */}
            {regions.map((region) => (
              <Button
                key={region.id}
                variant="outline"
                className={cn(
                  'h-auto p-4 flex flex-col items-start hover:bg-accent transition-colors',
                  selectedRegion?.id === region.id && 'ring-2 ring-primary bg-accent'
                )}
                onClick={() => handleSelectRegion(region)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-left">{region.name_uz}</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  {region.name_ru}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

