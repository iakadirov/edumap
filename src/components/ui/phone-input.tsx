'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { normalizePhone, formatPhoneForDisplay } from '@/lib/utils/phone';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Компонент для ввода номера телефона с маской
 * Автоматически форматирует ввод и нормализует значение
 */
export function PhoneInput({ value, onChange, className, ...props }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = React.useState<string>('');

  // Инициализация displayValue из value
  React.useEffect(() => {
    if (value) {
      const formatted = formatPhoneForDisplay(value) || value;
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Разрешаем только +, цифры, пробелы и дефисы для удобства ввода
    const cleaned = inputValue.replace(/[^\d+\s-]/g, '');
    
    // Нормализуем для сохранения
    const normalized = normalizePhone(cleaned);
    
    // Форматируем для отображения
    if (normalized) {
      const formatted = formatPhoneForDisplay(normalized);
      setDisplayValue(formatted || cleaned);
      
      // Вызываем onChange с нормализованным значением
      if (onChange) {
        onChange(normalized);
      }
    } else {
      // Если не удалось нормализовать, показываем как есть (для удобства ввода)
      setDisplayValue(cleaned);
      
      // Если пользователь удалил все, вызываем onChange с пустой строкой
      if (cleaned === '' && onChange) {
        onChange('');
      }
    }
  };

  const handleBlur = () => {
    // При потере фокуса нормализуем и форматируем
    const normalized = normalizePhone(displayValue);
    if (normalized) {
      const formatted = formatPhoneForDisplay(normalized);
      setDisplayValue(formatted || '');
      if (onChange) {
        onChange(normalized);
      }
    } else if (displayValue.trim() === '') {
      setDisplayValue('');
      if (onChange) {
        onChange('');
      }
    }
  };

  return (
    <Input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="+998901234567"
      maxLength={17} // +99890 123 45 67 = 17 символов
      className={cn(className)}
      {...props}
    />
  );
}

