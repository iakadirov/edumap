'use client';

import { BaseHeader } from './Header/BaseHeader';
import { HomeTopBar } from './Header/HomeTopBar';
import { HomeMainNav } from './Header/HomeMainNav';

/**
 * Header компонент для главной страницы и общих разделов
 * 
 * Использует BaseHeader с общим контентом:
 * - HomeTopBar - верхняя строка с навигацией по типам организаций
 * - HomeMainNav - основная навигация
 * 
 * Для раздела schools используется SchoolsHeader через schools/layout.tsx
 */
export function Header() {
  return (
    <BaseHeader
      topBar={<HomeTopBar />}
      mainNav={<HomeMainNav />}
    />
  );
}
