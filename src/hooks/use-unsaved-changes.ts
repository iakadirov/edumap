'use client';

import { useEffect, useRef } from 'react';

/**
 * Хук для предупреждения пользователя о несохраненных изменениях
 * 
 * @param hasUnsavedChanges - флаг наличия несохраненных изменений
 * @param message - сообщение для предупреждения (опционально)
 */
export function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  message?: string
) {
  const hasUnsavedRef = useRef(hasUnsavedChanges);

  // Обновляем ref при изменении флага
  useEffect(() => {
    hasUnsavedRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Предупреждение при попытке закрыть страницу
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault();
        e.returnValue = message || 'Sizda saqlanmagan o\'zgarishlar bor. Sahifani tark etishni xohlaysizmi?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message]);
}

