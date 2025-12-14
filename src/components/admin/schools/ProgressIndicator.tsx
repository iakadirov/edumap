'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

/**
 * Компонент для отображения прогресса заполнения (0-100%)
 */
export function ProgressIndicator({
  value,
  className,
  showLabel = true,
}: ProgressIndicatorProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const roundedValue = Math.round(clampedValue);

  // Определяем цвет на основе значения
  const getColor = () => {
    if (roundedValue === 100) return 'bg-green-500';
    if (roundedValue >= 80) return 'bg-green-400';
    if (roundedValue >= 60) return 'bg-yellow-400';
    if (roundedValue >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // Определяем иконку статуса
  const getStatusIcon = () => {
    if (roundedValue === 100) return '✅';
    if (roundedValue >= 60) return '⚠️';
    return '❌';
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        {showLabel && (
          <span className="text-muted-foreground">
            {getStatusIcon()} {roundedValue}%
          </span>
        )}
        {!showLabel && showLabel !== undefined && (
          <span className="text-muted-foreground">{roundedValue}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getColor())}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

