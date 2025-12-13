'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageOption {
  id: string;
  label: string;
  label_short: string;
}

interface LanguageChipsProps {
  options?: LanguageOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

const defaultLanguages: LanguageOption[] = [
  { id: 'russian', label: 'Rus', label_short: 'Рус' },
  { id: 'uzbek', label: 'O\'zbek', label_short: 'Узб' },
  { id: 'english', label: 'English', label_short: 'Eng' },
];

/**
 * Toggle chips для выбора языка обучения
 * 
 * Features:
 * - Multi-select chips
 * - Визуальное различие: inactive (outline) / active (filled + checkmark)
 * - Клик переключает состояние
 */
export function LanguageChips({
  options = defaultLanguages,
  selected,
  onSelectionChange,
  className,
}: LanguageChipsProps) {
  const toggleLanguage = (languageId: string) => {
    if (selected.includes(languageId)) {
      onSelectionChange(selected.filter((id) => id !== languageId));
    } else {
      onSelectionChange([...selected, languageId]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">Ta'lim tili</label>
      <div className="flex flex-wrap gap-2">
        {options.map((lang) => {
          const isSelected = selected.includes(lang.id);
          return (
            <Button
              key={lang.id}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleLanguage(lang.id)}
              className={cn(
                'gap-2',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent'
              )}
            >
              {isSelected && <Check className="h-4 w-4" />}
              <span>{lang.label_short || lang.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

