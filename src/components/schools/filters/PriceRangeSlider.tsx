'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PriceRangeSliderProps {
  value: [number, number];
  min: number;
  max: number;
  onValueChange: (value: [number, number]) => void;
  className?: string;
}

/**
 * Dual-handle range slider для фильтрации по цене
 * 
 * Features:
 * - Dual-handle slider
 * - Input поля для точного ввода
 * - Переключение валюты (UZS/USD)
 * - Форматирование цен
 */
export function PriceRangeSlider({
  value,
  min,
  max,
  onValueChange,
  className,
}: PriceRangeSliderProps) {
  const [showUSD, setShowUSD] = useState(false);
  const USD_RATE = 12500; // Примерный курс (можно получать из API)

  const formatPrice = (val: number, currency: 'UZS' | 'USD'): string => {
    if (currency === 'UZS') {
      if (val >= 1_000_000) {
        return `${(val / 1_000_000).toFixed(1)} млн`;
      }
      return val.toLocaleString('ru-RU');
    } else {
      const usdValue = Math.round(val / USD_RATE);
      return `$${usdValue.toLocaleString('en-US')}`;
    }
  };

  const formatInput = (val: number): string => {
    if (showUSD) {
      return Math.round(val / USD_RATE).toString();
    }
    return val.toLocaleString('ru-RU');
  };

  const parseInput = (str: string): number => {
    const num = Number(str.replace(/\s/g, ''));
    if (showUSD) {
      return Math.round(num * USD_RATE);
    }
    return num;
  };

  const [minInput, setMinInput] = useState(formatInput(value[0]));
  const [maxInput, setMaxInput] = useState(formatInput(value[1]));

  const handleSliderChange = (newValue: number[]) => {
    const newRange: [number, number] = [newValue[0], newValue[1]];
    onValueChange(newRange);
    setMinInput(formatInput(newRange[0]));
    setMaxInput(formatInput(newRange[1]));
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setMinInput(str);
    const num = parseInput(str);
    if (!isNaN(num) && num >= min && num < value[1]) {
      onValueChange([num, value[1]]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setMaxInput(str);
    const num = parseInput(str);
    if (!isNaN(num) && num > value[0] && num <= max) {
      onValueChange([value[0], num]);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Narx (oyiga)</Label>
        <div className="flex items-center gap-2">
          <Checkbox
            id="usd-toggle"
            checked={showUSD}
            onCheckedChange={(checked) => {
              setShowUSD(checked === true);
              setMinInput(formatInput(value[0]));
              setMaxInput(formatInput(value[1]));
            }}
          />
          <Label
            htmlFor="usd-toggle"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            USD da ko'rsatish
          </Label>
        </div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[value[0], value[1]]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={500000}
          className="w-full"
        />
      </div>

      {/* Input поля */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <Label htmlFor="price-min" className="text-xs text-muted-foreground">
            Dan
          </Label>
          <div className="relative">
            <Input
              id="price-min"
              value={minInput}
              onChange={handleMinInputChange}
              onBlur={() => setMinInput(formatInput(value[0]))}
              className="pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {showUSD ? '$' : 'so\'m'}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <Label htmlFor="price-max" className="text-xs text-muted-foreground">
            Gacha
          </Label>
          <div className="relative">
            <Input
              id="price-max"
              value={maxInput}
              onChange={handleMaxInputChange}
              onBlur={() => setMaxInput(formatInput(value[1]))}
              className="pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {showUSD ? '$' : 'so\'m'}
            </span>
          </div>
        </div>
      </div>

      {/* Текущий диапазон (опционально) */}
      <div className="text-xs text-center text-muted-foreground">
        {formatPrice(value[0], showUSD ? 'USD' : 'UZS')} -{' '}
        {formatPrice(value[1], showUSD ? 'USD' : 'UZS')}
      </div>
    </div>
  );
}

