'use client';

import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export interface FieldError {
  field: string;
  message: string;
}

interface ErrorDisplayProps {
  errors: FieldError[];
  onDismiss?: () => void;
  className?: string;
  scrollToFirst?: boolean;
}

/**
 * Компонент для понятного отображения ошибок валидации
 * 
 * Features:
 * - Группировка ошибок по полям
 * - Автоматическое скроллирование к первой ошибке
 * - Возможность закрыть ошибки
 * - Понятные сообщения на узбекском языке
 */
export function ErrorDisplay({
  errors,
  onDismiss,
  className,
  scrollToFirst = true,
}: ErrorDisplayProps) {
  const firstErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToFirst && errors.length > 0 && firstErrorRef.current) {
      // Небольшая задержка для рендеринга
      setTimeout(() => {
        firstErrorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [errors, scrollToFirst]);

  if (errors.length === 0) {
    return null;
  }

  // Группируем ошибки по полям
  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error.message);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div
      ref={firstErrorRef}
      className={cn(
        'p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 space-y-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">
              Xatoliklar topildi ({errors.length})
            </h3>
            <div className="space-y-2">
              {Object.entries(groupedErrors).map(([field, messages]) => (
                <div key={field} className="space-y-1">
                  <div className="font-medium text-sm">
                    {getFieldLabel(field)}:
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {messages.map((message, index) => (
                      <li key={index} className="text-sm">
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Получить читаемое название поля
 */
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: 'Maktab nomi',
    name_uz: 'Maktab nomi',
    phone: 'Telefon raqami',
    email: 'Email',
    address: 'Manzil',
    coordinates: 'Joylashuv',
    school_type: 'Maktab turi',
    grade_from: 'Boshlang\'ich sinf',
    grade_to: 'Yakuniy sinf',
    grades: 'Sinflar',
    fee_monthly_min: 'Minimal oylik to\'lov',
    fee_monthly_max: 'Maksimal oylik to\'lov',
    fees: 'To\'lovlar',
    curriculum: 'O\'quv dasturi',
    primary_language: 'Asosiy til',
    url: 'URL',
  };

  return labels[field] || field;
}

