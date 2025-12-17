'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StarBold } from '@solar-icons/react-perf';
import { cn } from '@/lib/utils';

interface RatingOption {
  value: number;
  label: string;
  stars: number;
  count?: number;
}

interface RatingRadioProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  options?: RatingOption[];
  className?: string;
}

const defaultOptions: RatingOption[] = [
  { value: 5, label: 'Faqat 5 yulduz', stars: 5 },
  { value: 4, label: '4 va yuqori', stars: 4 },
  { value: 3, label: '3 va yuqori', stars: 3 },
  { value: 2, label: '2 va yuqori', stars: 2 },
  { value: 0, label: 'Har qanday reyting', stars: 0 },
];

/**
 * Radio buttons для выбора минимального рейтинга со звездами
 * 
 * Features:
 * - Radio buttons (single select)
 * - Показывает количество школ для каждого уровня (опционально)
 * - Звезды визуально заполнены до выбранного уровня
 * - По умолчанию: "Любой рейтинг"
 */
export function RatingRadio({
  value,
  onValueChange,
  options = defaultOptions,
  className,
}: RatingRadioProps) {
  const handleValueChange = (newValue: string) => {
    const numValue = Number(newValue);
    if (numValue === 0) {
      onValueChange(undefined);
    } else {
      onValueChange(numValue);
    }
  };

  const renderStars = (count: number, total: number = 5) => {
    return Array.from({ length: total }).map((_, i) => (
      <StarBold
        key={i}
        className={cn(
          'h-4 w-4',
          i < count
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-none text-muted-foreground'
        )}
      />
    ));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium">Minimal reyting</Label>
      <RadioGroup
        value={value?.toString() || '0'}
        onValueChange={handleValueChange}
      >
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 space-y-0"
            >
              <RadioGroupItem value={option.value.toString()} id={`rating-${option.value}`} />
              <Label
                htmlFor={`rating-${option.value}`}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <div className="flex items-center gap-1">
                  {renderStars(option.stars)}
                </div>
                <span className="text-sm">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    ({option.count})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}

