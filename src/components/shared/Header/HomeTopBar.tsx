'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RegionSelector } from '@/components/shared/RegionSelector';
import {
  MapPointBold,
  BookBold,
  SmileCircleBold,
  SquareAcademicCapBold,
  NotebookBold,
  AddCircleBold,
  AltArrowDownLinear,
} from '@solar-icons/react-perf';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Верхняя строка Header для главной страницы и общих разделов
 * 
 * Features:
 * - Выбор региона/города
 * - Навигация по типам организаций
 * - Кнопка добавления организации
 */
export function HomeTopBar() {
  const pathname = usePathname();

  // Определяем активный тип организации
  const getActiveOrgType = () => {
    if (pathname.startsWith('/kindergartens')) return 'kindergartens';
    if (pathname.startsWith('/schools')) return 'schools';
    if (pathname.startsWith('/universities')) return 'universities';
    if (pathname.startsWith('/courses')) return 'courses';
    return null;
  };

  const activeOrgType = getActiveOrgType();

  return (
    <div className="container-wrapper">
      <div className="w-full py-3 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
      {/* Левая часть: выбор города и навигация по типам */}
      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
        {/* Выбор города */}
        <div className="hidden lg:block">
          <RegionSelector />
        </div>
        
        {/* Мобильная версия выбора города */}
        <Button
          variant="ghost"
          className="lg:hidden h-11 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl gap-1"
          onClick={() => {
            const button = document.querySelector('[data-region-selector]') as HTMLElement;
            button?.click();
          }}
        >
          <MapPointBold className="h-5 w-5 text-slate-600" />
          <span className="text-base font-medium text-slate-600">
            Toshkent
          </span>
          <AltArrowDownLinear className="h-3 w-3 text-slate-600" />
        </Button>

        {/* Навигация по типам организаций */}
        <div className="px-2 sm:px-4 py-1 bg-slate-100 rounded-xl flex items-center gap-3 sm:gap-6 overflow-x-auto">
          <Link
            href="/kindergartens"
            className={cn(
              'px-2 py-[6px] flex items-center gap-1 transition-all',
              activeOrgType === 'kindergartens'
                ? 'bg-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.15)] border-l-2 border-green-500 rounded-lg'
                : 'rounded-xl hover:bg-white/50'
            )}
          >
            <SmileCircleBold className={cn(
              'h-5 w-5',
              activeOrgType === 'kindergartens' ? 'text-green-500' : 'text-slate-600'
            )} />
            <span className={cn(
              'text-base',
              activeOrgType === 'kindergartens'
                ? 'text-green-500 font-semibold'
                : 'text-slate-600 font-medium'
            )}>
              Bog'chalar
            </span>
          </Link>

          <Link
            href="/schools"
            className={cn(
              'px-2 py-[6px] flex items-center gap-1 transition-all',
              activeOrgType === 'schools'
                ? 'bg-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.15)] border-l-2 border-blue-600 rounded-lg'
                : 'rounded-xl hover:bg-white/50'
            )}
          >
            <BookBold className={cn(
              'h-5 w-5',
              activeOrgType === 'schools' ? 'text-blue-600' : 'text-slate-600'
            )} />
            <span className={cn(
              'text-base',
              activeOrgType === 'schools'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-600 font-medium'
            )}>
              Maktablar
            </span>
          </Link>

          <Link
            href="/universities"
            className={cn(
              'px-2 py-[6px] flex items-center gap-1 transition-all',
              activeOrgType === 'universities'
                ? 'bg-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.15)] border-l-2 border-purple-600 rounded-lg'
                : 'rounded-xl hover:bg-white/50'
            )}
          >
            <SquareAcademicCapBold className={cn(
              'h-5 w-5',
              activeOrgType === 'universities' ? 'text-purple-600' : 'text-slate-600'
            )} />
            <span className={cn(
              'text-base',
              activeOrgType === 'universities'
                ? 'text-purple-600 font-semibold'
                : 'text-slate-600 font-medium'
            )}>
              Oliygohlar
            </span>
          </Link>

          <Link
            href="/courses"
            className={cn(
              'px-2 py-[6px] flex items-center gap-1 transition-all',
              activeOrgType === 'courses'
                ? 'bg-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.15)] border-l-2 border-orange-500 rounded-lg'
                : 'rounded-xl hover:bg-white/50'
            )}
          >
            <NotebookBold className={cn(
              'h-5 w-5',
              activeOrgType === 'courses' ? 'text-orange-500' : 'text-slate-600'
            )} />
            <span className={cn(
              'text-base',
              activeOrgType === 'courses'
                ? 'text-orange-500 font-semibold'
                : 'text-slate-600 font-medium'
            )}>
              Kurslar
            </span>
          </Link>
        </div>
      </div>

      {/* Правая часть: кнопки действий */}
      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          asChild
          className="h-11 px-3 sm:px-4 py-3 bg-white border-[1.5px] border-slate-200 rounded-xl gap-1 hover:bg-gray-50"
        >
          <Link href="/admin/schools/new">
            <AddCircleBold className="h-5 w-5 text-slate-600" />
            <span className="hidden sm:inline text-base font-medium text-slate-600">
              Tashkilot qo'shish
            </span>
          </Link>
        </Button>
      </div>
      </div>
    </div>
  );
}

