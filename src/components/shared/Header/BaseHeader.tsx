'use client';

import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseHeaderProps {
  /**
   * Контент верхней строки (топ бар)
   * Будет автоматически скрываться при скролле
   */
  topBar?: ReactNode;
  
  /**
   * Контент основной шапки (нижняя строка)
   * Будет уменьшать padding при скролле
   */
  mainNav: ReactNode;
  
  /**
   * Дополнительный контент (например, spacer)
   */
  children?: ReactNode;
}

/**
 * Базовый Header компонент с Pure CSS Sticky позиционированием
 * 
 * Features:
 * - Pure CSS sticky позиционирование
 * - Top bar прокручивается, основная шапка остается sticky
 * - Плавное уменьшение padding при скролле
 * - Не вызывает дёргания контента
 * - Композабельная структура через props
 */
export function BaseHeader({ topBar, mainNav, children }: BaseHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Проверяем начальное состояние

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Верхняя строка - обычный элемент, прокручивается */}
      {topBar && (
        <div className="w-full bg-white border-b border-gray-200">
          {topBar}
        </div>
      )}

      {/* Нижняя строка - sticky, остается на месте при скролле */}
      <div className={cn(
        "sticky top-0 w-full bg-white z-50 transition-shadow duration-300",
        isScrolled && "shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
      )}>
        <div className="container-wrapper">
          <div 
            className={cn(
              'w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 transition-[padding] duration-300 ease-out',
              isScrolled ? 'py-3' : 'py-6'
            )}
          >
            {mainNav}
          </div>
        </div>
      </div>
      
      {children}
    </>
  );
}

