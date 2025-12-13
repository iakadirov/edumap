'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useRegion, type Region } from '@/contexts/RegionContext';

/**
 * Модальное окно для первого выбора области
 * Показывается если область еще не выбрана
 */
export function RegionDialog() {
  const { selectedRegion, setSelectedRegion } = useRegion();
  const [regions, setRegions] = useState<Region[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Показываем диалог только если область не выбрана
  useEffect(() => {
    if (!selectedRegion) {
      setIsOpen(true);
    }
  }, [selectedRegion]);

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

  const handleSelectRegion = (region: Region) => {
    setSelectedRegion(region);
    setIsOpen(false);
  };

  // Не показываем если область уже выбрана
  if (selectedRegion) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Viloyatingizni tanlang</DialogTitle>
          <DialogDescription>
            Qaysi viloyatda joylashgan maktablarni ko'rmoqchisiz?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto py-4">
          {regions.map((region) => (
            <Button
              key={region.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start hover:bg-accent transition-colors"
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

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => {
              // Можно выбрать "Все Узбекистан" (пока null)
              setSelectedRegion(null);
              setIsOpen(false);
            }}
          >
            O'zbekiston bo'ylab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

