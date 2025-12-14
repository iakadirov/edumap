'use client';

import { BaseHeader } from '@/components/shared/Header/BaseHeader';
import { SchoolsTopBar } from './SchoolsTopBar';
import { SchoolsMainNav } from './SchoolsMainNav';

/**
 * Header компонент для раздела школ
 * 
 * Использует BaseHeader с раздел-специфичным контентом:
 * - SchoolsTopBar - верхняя строка с навигацией по типам организаций
 * - SchoolsMainNav - основная навигация
 */
export function SchoolsHeader() {
  return (
    <BaseHeader
      topBar={<SchoolsTopBar />}
      mainNav={<SchoolsMainNav />}
    />
  );
}

