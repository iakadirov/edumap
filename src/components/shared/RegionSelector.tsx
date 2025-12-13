'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MapPin } from 'lucide-react';
import { useRegion, type Region } from '@/contexts/RegionContext';
import { cn } from '@/lib/utils';

/**
 * Компонент выбора области в Header
 * 
 * Features:
 * - Отображение выбранной области
 * - Dropdown для выбора области
 * - Сохранение в localStorage через RegionContext
 */
export function RegionSelector() {
  const { selectedRegion, setSelectedRegion, isLoading } = useRegion();
  const [regions, setRegions] = useState<Region[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <MapPin className="h-4 w-4" />
        <span>Yuklanmoqda...</span>
      </Button>
    );
  }

  const displayName = selectedRegion?.name_uz || 'Viloyatni tanlang';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] max-h-[400px] overflow-y-auto">
        {regions.map((region) => (
          <DropdownMenuItem
            key={region.id}
            onClick={() => handleSelectRegion(region)}
            className={cn(
              'cursor-pointer',
              selectedRegion?.id === region.id && 'bg-accent'
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{region.name_uz}</span>
              <span className="text-xs text-muted-foreground">{region.name_ru}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

