'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
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
 * Базовый Header компонент с логикой sticky и скролла
 * 
 * Features:
 * - Sticky позиционирование
 * - Автоматическое скрытие топ бара при скролле
 * - Уменьшение высоты основной шапки при скролле
 * - Композабельная структура через props
 */
export function BaseHeader({ topBar, mainNav, children }: BaseHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const topBarRef = useRef<HTMLDivElement>(null);

  // Измеряем высоту топ бара один раз при монтировании
  useEffect(() => {
    let measured = false;
    
    const measureHeight = () => {
      if (!measured && topBarRef.current && window.scrollY === 0) {
        const rect = topBarRef.current.getBoundingClientRect();
        if (rect.height > 0 && rect.top >= 0) {
          setTopBarHeight(rect.height);
          measured = true;
        }
      }
    };
    
    measureHeight();
    const timeoutId = setTimeout(measureHeight, 100);
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(measureHeight);
    });
    
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Отслеживаем скролл для управления топ баром и основной шапкой
  useEffect(() => {
    let rafId: number | null = null;
    
    const handleScroll = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const topBarHeightValue = topBarHeight > 0 ? topBarHeight : 68;
        
        // Snap эффект для топ бара: при скролле больше 15px сразу скрываем
        const SNAP_SCROLL_PX = 15;
        let finalTopBarProgress = 0;
        if (scrollY >= SNAP_SCROLL_PX) {
          finalTopBarProgress = 1;
        }
        
        setScrollProgress((prev) => {
          if (Math.abs(prev - finalTopBarProgress) < 0.01) return prev;
          return finalTopBarProgress;
        });
        
        // Основная шапка уменьшается после скрытия топ бара
        const MAIN_HEADER_START = topBarHeightValue;
        setIsScrolled(scrollY >= MAIN_HEADER_START);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [topBarHeight]);

  const topBarHeightValue = topBarHeight > 0 ? topBarHeight : 68;
  const mainHeaderTop = scrollProgress >= 1 ? 0 : topBarHeightValue;

  return (
    <>
      {/* Верхняя строка - position: fixed, скрывается через transform */}
      {topBar && (
        <div 
          ref={topBarRef}
          className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-[60] transition-transform duration-300 ease-out"
          style={{
            transform: scrollProgress >= 1 ? 'translateY(-100%)' : 'translateY(0)',
            pointerEvents: scrollProgress >= 1 ? 'none' : 'auto',
          }}
        >
          {topBar}
        </div>
      )}

      {/* Нижняя строка - position: fixed, позиционируется относительно топ бара */}
      <div 
        className="fixed left-0 right-0 w-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] z-50 transition-all duration-300 ease-out"
        style={{
          top: `${mainHeaderTop}px`,
        }}
      >
        <div 
          className={cn(
            'max-w-[1440px] mx-auto px-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 transition-all duration-300',
            isScrolled ? 'py-3' : 'py-6'
          )}
        >
          {mainNav}
        </div>
      </div>
      
      {/* Spacer для основного контента */}
      <div 
        style={{
          height: scrollProgress >= 1 
            ? `${isScrolled ? 48 : 72}px`
            : `${topBarHeightValue + (isScrolled ? 48 : 72)}px`,
          transition: 'height 0.3s ease-out',
        }}
      />
      
      {children}
    </>
  );
}

