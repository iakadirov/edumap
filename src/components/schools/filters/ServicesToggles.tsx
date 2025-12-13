'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Bus, UtensilsCrossed, Clock } from 'lucide-react';

interface ServiceOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ServicesTogglesProps {
  transport?: boolean;
  meals?: boolean;
  extendedDay?: boolean;
  onTransportChange: (value: boolean) => void;
  onMealsChange: (value: boolean) => void;
  onExtendedDayChange: (value: boolean) => void;
  className?: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: 'transport',
    label: 'Transport',
    icon: <Bus className="h-4 w-4" />,
  },
  {
    id: 'meals',
    label: 'Ovqatlanish',
    icon: <UtensilsCrossed className="h-4 w-4" />,
  },
  {
    id: 'extended_day',
    label: 'Kengaytirilgan kun',
    icon: <Clock className="h-4 w-4" />,
  },
];

/**
 * Toggle switches для услуг школы
 * 
 * Features:
 * - Toggle switch (on/off)
 * - Off = показать все школы (неважно есть ли услуга)
 * - On = показать только школы с этой услугой
 * - Иконки для визуального распознавания
 */
export function ServicesToggles({
  transport = false,
  meals = false,
  extendedDay = false,
  onTransportChange,
  onMealsChange,
  onExtendedDayChange,
  className,
}: ServicesTogglesProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Label className="text-sm font-medium">Xizmatlar</Label>
      <div className="space-y-3">
        {/* Транспорт */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              <Bus className="h-4 w-4" />
            </div>
            <Label htmlFor="transport" className="cursor-pointer">
              Transport
            </Label>
          </div>
          <Switch
            id="transport"
            checked={transport}
            onCheckedChange={onTransportChange}
          />
        </div>

        {/* Питание */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <Label htmlFor="meals" className="cursor-pointer">
              Ovqatlanish
            </Label>
          </div>
          <Switch
            id="meals"
            checked={meals}
            onCheckedChange={onMealsChange}
          />
        </div>

        {/* Продлёнка */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <Label htmlFor="extended-day" className="cursor-pointer">
              Kengaytirilgan kun
            </Label>
          </div>
          <Switch
            id="extended-day"
            checked={extendedDay}
            onCheckedChange={onExtendedDayChange}
          />
        </div>
      </div>
    </div>
  );
}

