'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MagniferBold,
  CloseCircleBold,
} from '@solar-icons/react-perf';
import { cn } from '@/lib/utils';

interface RegionOption {
  id: string;
  name: string;
  name_uz: string;
  count?: number;
}

interface RegionMultiSelectProps {
  options: RegionOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Multi-select dropdown для выбора регионов (областей) с поиском
 * 
 * Features:
 * - Multi-select с чекбоксами
 * - Поиск по названию региона (русский и узбекский)
 * - Показывает количество школ в каждом регионе
 * - Выбранные регионы отображаются как chips под dropdown
 * - Клик на × удаляет регион из выбора
 */
export function RegionMultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = 'Barcha viloyatlar',
  className,
}: RegionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтруем опции по поисковому запросу
  const filteredOptions = options.filter((option) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const name = option.name?.toLowerCase() || '';
    const nameUz = option.name_uz?.toLowerCase() || '';
    return (
      name.includes(query) ||
      nameUz.includes(query)
    );
  });

  // Получаем выбранные опции
  const selectedOptions = options.filter((option) =>
    selected.includes(option.id)
  );

  const toggleRegion = (regionId: string) => {
    if (selected.includes(regionId)) {
      onSelectionChange(selected.filter((id) => id !== regionId));
    } else {
      onSelectionChange([...selected, regionId]);
    }
  };

  const removeRegion = (regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selected.filter((id) => id !== regionId));
  };

  const selectedCount = selected.length;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">Viloyat</label>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal h-auto min-h-[2.5rem]"
          >
            <span className={cn('truncate', !selectedCount && 'text-muted-foreground')}>
              {selectedCount === 0
                ? placeholder
                : selectedCount === 1
                ? selectedOptions[0]?.name_uz || selectedOptions[0]?.name
                : `${selectedCount} viloyat tanlandi`}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] p-0" align="start">
          {/* Поиск */}
          <div className="p-2 border-b sticky top-0 bg-background z-10">
            <div className="relative">
              <MagniferBold className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  // Предотвращаем закрытие dropdown при нажатии Enter
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              />
            </div>
          </div>

          {/* Список опций с чекбоксами */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Hech narsa topilmadi
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => toggleRegion(option.id)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRegion(option.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-none"
                      />
                      <span className="flex-1 text-sm">
                        {option.name_uz || option.name}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          ({option.count})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Выбранные регионы как chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{option.name_uz || option.name}</span>
              <button
                onClick={(e) => removeRegion(option.id, e)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                aria-label={`Remove ${option.name_uz || option.name}`}
              >
                <CloseCircleBold className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

