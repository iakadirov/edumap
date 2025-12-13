'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectLabel,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface GradeSelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  className?: string;
}

const gradeOptions = [
  { value: 'any', label: 'Har qanday sinf', group: null },
  { value: 'preschool', label: 'Maktabga tayyorgarlik (5-6 yosh)', age: '5-6 yosh', group: 'preschool' },
  { value: '1', label: '1-sinf', age: '6-7 yosh', group: 'primary' },
  { value: '2', label: '2-sinf', group: 'primary' },
  { value: '3', label: '3-sinf', group: 'primary' },
  { value: '4', label: '4-sinf', group: 'primary' },
  { value: '5', label: '5-sinf', age: '10-11 yosh', group: 'middle' },
  { value: '6', label: '6-sinf', group: 'middle' },
  { value: '7', label: '7-sinf', group: 'middle' },
  { value: '8', label: '8-sinf', group: 'high' },
  { value: '9', label: '9-sinf', group: 'high' },
  { value: '10', label: '10-sinf', age: '15-16 yosh', group: 'high' },
  { value: '11', label: '11-sinf', group: 'high' },
];

const gradeGroups = {
  preschool: 'Maktabgacha',
  primary: 'Boshlang\'ich maktab',
  middle: 'O\'rta maktab',
  high: 'Oliy maktab',
};

/**
 * Select для выбора класса поступления
 * 
 * Features:
 * - Single-select dropdown
 * - Группировка по ступеням образования
 * - Показывает примерный возраст для ключевых классов
 */
export function GradeSelect({
  value,
  onValueChange,
  className,
}: GradeSelectProps) {
  // Группируем опции по группам
  const groupedOptions = gradeOptions.reduce((acc, option) => {
    if (option.group) {
      if (!acc[option.group]) {
        acc[option.group] = [];
      }
      acc[option.group].push(option);
    } else {
      acc['any'] = [option];
    }
    return acc;
  }, {} as Record<string, typeof gradeOptions>);

  const handleValueChange = (newValue: string) => {
    if (newValue === 'any') {
      onValueChange(undefined);
    } else {
      onValueChange(newValue);
    }
  };

  const selectedLabel =
    gradeOptions.find((opt) => opt.value === value)?.label ||
    'Har qanday sinf';

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">Qabul qilish sinfi</Label>
      <Select
        value={value || 'any'}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Любой класс */}
          {groupedOptions['any']?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}

          {/* Группы */}
          {Object.entries(gradeGroups).map(([groupKey, groupLabel]) => {
            const groupOptions = groupedOptions[groupKey] || [];
            if (groupOptions.length === 0) return null;

            return (
              <div key={groupKey}>
                <SelectSeparator />
                <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {groupLabel}
                </SelectLabel>
                {groupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {option.age && (
                        <span className="text-xs text-muted-foreground">
                          ({option.age})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

