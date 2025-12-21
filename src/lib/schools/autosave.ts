/**
 * Хук для автоматического сохранения изменений
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutosaveOptions<T = unknown> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number; // Интервал автосохранения в миллисекундах (по умолчанию 30000)
  debounceMs?: number; // Debounce для сохранения после изменений (по умолчанию 2000)
  enabled?: boolean; // Включено ли автосохранение (по умолчанию true)
}

export interface UseAutosaveResult {
  status: AutosaveStatus;
  lastSaved: Date | null;
  error: Error | null;
  save: () => Promise<void>;
  hasUnsavedChanges: boolean;
}

/**
 * Хук для автоматического сохранения данных
 */
export function useAutosave<T = unknown>({
  data,
  onSave,
  interval = 30000, // 30 секунд
  debounceMs = 2000, // 2 секунды
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const dataRef = useRef(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Обновляем ref при изменении data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Функция сохранения
  const save = useCallback(async () => {
    if (isSavingRef.current || !enabled) {
      return;
    }

    isSavingRef.current = true;
    setStatus('saving');
    setError(null);

    try {
      await onSave(dataRef.current);
      setStatus('saved');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      // Через 2 секунды возвращаем статус в idle
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);
      setStatus('error');
      console.error('Autosave error:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, enabled]);

  // Автосохранение по интервалу
  useEffect(() => {
    if (!enabled) {
      return;
    }

    intervalRef.current = setInterval(() => {
      if (hasUnsavedChanges && !isSavingRef.current) {
        save();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasUnsavedChanges, save]);

  // Автосохранение при изменении данных (с debounce)
  useEffect(() => {
    if (!enabled) {
      return;
    }

    setHasUnsavedChanges(true);

    // Очищаем предыдущий timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый timeout для сохранения
    timeoutRef.current = setTimeout(() => {
      if (!isSavingRef.current && hasUnsavedChanges) {
        save();
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, hasUnsavedChanges, save]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    error,
    save,
    hasUnsavedChanges,
  };
}

/**
 * Форматирование статуса для отображения пользователю
 */
export function formatAutosaveStatus(status: AutosaveStatus): string {
  switch (status) {
    case 'idle':
      return 'Saqlanmagan o\'zgarishlar yo\'q';
    case 'saving':
      return 'Saqlanmoqda...';
    case 'saved':
      return 'Saqlandi';
    case 'error':
      return 'Xatolik yuz berdi';
    default:
      return '';
  }
}

