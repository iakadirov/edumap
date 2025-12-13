'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CurriculumOption {
  id: string;
  label: string;
  description: string;
}

interface CurriculumChipsProps {
  options?: CurriculumOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

const defaultCurricula: CurriculumOption[] = [
  {
    id: 'cambridge',
    label: 'Cambridge',
    description:
      'Britaniya dasturi xalqaro tan olingan. IGCSE va A-Level ni o\'z ichiga oladi.',
  },
  {
    id: 'ib',
    label: 'IB',
    description:
      'International Baccalaureate. Tanqidiy fikrlash va xalqaro tushunishni rivojlantiradi.',
  },
  {
    id: 'national_plus',
    label: 'Milliy+',
    description: 'Milliy dastur qo\'shimcha fanlar bilan kuchaytirilgan.',
  },
  {
    id: 'american',
    label: 'American',
    description: 'Amerika dasturi. SAT, AP kurslariga tayyorgarlik.',
  },
  {
    id: 'mixed',
    label: 'Aralash',
    description: 'Milliy va xalqaro dasturlarning kombinatsiyasi.',
  },
];

/**
 * Multi-select chips для выбора учебной программы с tooltips
 * 
 * Features:
 * - Multi-select chips
 * - Tooltip с описанием при hover
 * - Если ничего не выбрано = показать все
 */
export function CurriculumChips({
  options = defaultCurricula,
  selected,
  onSelectionChange,
  className,
}: CurriculumChipsProps) {
  const toggleCurriculum = (curriculumId: string) => {
    if (selected.includes(curriculumId)) {
      onSelectionChange(selected.filter((id) => id !== curriculumId));
    } else {
      onSelectionChange([...selected, curriculumId]);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn('space-y-2', className)}>
        <label className="text-sm font-medium">Dastur</label>
        <div className="flex flex-wrap gap-2">
          {options.map((curr) => {
            const isSelected = selected.includes(curr.id);
            return (
              <Tooltip key={curr.id}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCurriculum(curr.id)}
                    className={cn(
                      'gap-2',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-accent'
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    <span>{curr.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-sm">{curr.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

