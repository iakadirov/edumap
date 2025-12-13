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
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistrictOption {
  id: string;
  name: string;
  name_uz: string;
  count?: number;
}

interface DistrictMultiSelectProps {
  options: DistrictOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Multi-select dropdown для выбора районов с поиском
 * 
 * Features:
 * - Multi-select с чекбоксами
 * - Поиск по названию района
 * - Показывает количество школ в каждом районе
 * - Выбранные районы отображаются как chips
 */
export function DistrictMultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = 'Barcha tumanlar',
  className,
}: DistrictMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтруем опции по поисковому запросу
  const filteredOptions = options.filter((option) => {
    const query = searchQuery.toLowerCase();
    return (
      option.name.toLowerCase().includes(query) ||
      option.name_uz.toLowerCase().includes(query)
    );
  });

  // Получаем выбранные опции
  const selectedOptions = options.filter((option) =>
    selected.includes(option.id)
  );

  const toggleDistrict = (districtId: string) => {
    if (selected.includes(districtId)) {
      onSelectionChange(selected.filter((id) => id !== districtId));
    } else {
      onSelectionChange([...selected, districtId]);
    }
  };

  const removeDistrict = (districtId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selected.filter((id) => id !== districtId));
  };

  const selectedCount = selected.length;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">Tuman</label>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
          >
            <span className={cn('truncate', !selectedCount && 'text-muted-foreground')}>
              {selectedCount === 0
                ? placeholder
                : selectedCount === 1
                ? selectedOptions[0]?.name_uz || selectedOptions[0]?.name
                : `${selectedCount} tuman tanlandi`}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] p-0" align="start">
          {/* Поиск */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Список опций */}
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
                      className="flex items-center gap-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                      onClick={() => toggleDistrict(option.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDistrict(option.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="flex-1 text-sm">
                        {option.name_uz || option.name}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
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

      {/* Выбранные районы как chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span>{option.name_uz || option.name}</span>
              <button
                onClick={(e) => removeDistrict(option.id, e)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

