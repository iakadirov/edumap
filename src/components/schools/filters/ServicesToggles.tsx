'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  BusBold,
  PlateBold,
  ClockCircleBold,
} from '@solar-icons/react-perf';

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
    icon: <BusBold className="h-4 w-4" />,
  },
  {
    id: 'meals',
    label: 'Ovqatlanish',
    icon: <PlateBold className="h-4 w-4" />,
  },
  {
    id: 'extended_day',
    label: 'Kengaytirilgan kun',
    icon: <ClockCircleBold className="h-4 w-4" />,
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
  const isHorizontal = className?.includes('space-y-0');

  return (
    <div className={cn('space-y-4', className)}>
      {!isHorizontal && (
        <Label className="text-sm font-medium">Xizmatlar</Label>
      )}
      <div className={cn(isHorizontal ? 'flex flex-row gap-4' : 'space-y-3')}>
        {/* Транспорт */}
        <div className={cn('flex items-center', isHorizontal ? 'gap-2' : 'justify-between')}>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <BusBold className="h-4 w-4" />
            </div>
            <Label htmlFor="transport" className="cursor-pointer text-sm">
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
        <div className={cn('flex items-center', isHorizontal ? 'gap-2' : 'justify-between')}>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <PlateBold className="h-4 w-4" />
            </div>
            <Label htmlFor="meals" className="cursor-pointer text-sm">
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
        <div className={cn('flex items-center', isHorizontal ? 'gap-2' : 'justify-between')}>
          <div className="flex items-center gap-2">
            <div className="text-muted-foreground">
              <ClockCircleBold className="h-4 w-4" />
            </div>
            <Label htmlFor="extended-day" className="cursor-pointer text-sm">
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

