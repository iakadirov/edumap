'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/lib/supabase/queries';

interface SortSelectProps {
  value?: SortOption;
  onValueChange: (value: SortOption) => void;
  className?: string;
}

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'rating_desc', label: 'Reyting bo\'yicha (yuqori →)' },
  { value: 'rating_asc', label: 'Reyting bo\'yicha (past →)' },
  { value: 'price_asc', label: 'Narx bo\'yicha (arzon →)' },
  { value: 'price_desc', label: 'Narx bo\'yicha (qimmat →)' },
  { value: 'reviews_desc', label: 'Sharhlar soni bo\'yicha' },
  { value: 'popularity', label: 'Mashhurlik bo\'yicha' },
];

/**
 * Компонент сортировки результатов поиска школ
 * 
 * Features:
 * - Сортировка по рейтингу, цене, отзывам, популярности
 * - Значение по умолчанию: по рейтингу (высокий →)
 */
export function SortSelect({ value = 'rating_desc', onValueChange, className }: SortSelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">Tartiblash</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full md:w-[250px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

