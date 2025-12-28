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

  const orgTypes = [
    {
      id: 'kindergartens',
      href: '/kindergartens',
      label: "Bog'chalar",
      icon: SmileCircleBold,
      activeColor: 'text-green-500',
      borderColor: 'border-green-500',
    },
    {
      id: 'schools',
      href: '/schools',
      label: 'Maktablar',
      icon: BookBold,
      activeColor: 'text-blue-600',
      borderColor: 'border-blue-600',
    },
    {
      id: 'universities',
      href: '/universities',
      label: 'Oliygohlar',
      icon: SquareAcademicCapBold,
      activeColor: 'text-purple-600',
      borderColor: 'border-purple-600',
    },
    {
      id: 'courses',
      href: '/courses',
      label: 'Kurslar',
      icon: NotebookBold,
      activeColor: 'text-orange-500',
      borderColor: 'border-orange-500',
    },
  ];

  return (
    <div className="container-wrapper">
      <div className="w-full py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-0">
        {/* Левая часть: выбор города и навигация по типам */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-8 w-full sm:w-auto">
          {/* Выбор города - Desktop */}
          <div className="hidden lg:block">
            <RegionSelector />
          </div>

          {/* Мобильная версия выбора города */}
          <Button
            variant="ghost"
            className="lg:hidden h-9 sm:h-11 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-[10px] sm:rounded-[12px] gap-1"
            onClick={() => {
              const button = document.querySelector(
                '[data-region-selector]'
              ) as HTMLElement;
              button?.click();
            }}
          >
            <MapPointBold className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            <span className="text-sm sm:text-base font-medium text-slate-600">
              Toshkent
            </span>
            <AltArrowDownLinear className="h-3 w-3 text-slate-600" />
          </Button>

          {/* Навигация по типам организаций - с горизонтальной прокруткой на мобильных */}
          <div className="flex-1 sm:flex-none overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="px-1.5 sm:px-2 md:px-4 py-1 bg-slate-100 rounded-[10px] sm:rounded-[12px] flex items-center gap-1 sm:gap-3 md:gap-6 min-w-max">
              {orgTypes.map((org) => {
                const Icon = org.icon;
                const isActive = activeOrgType === org.id;
                return (
                  <Link
                    key={org.id}
                    href={org.href}
                    className={cn(
                      'px-1.5 sm:px-2 py-1 sm:py-[6px] flex items-center gap-0.5 sm:gap-1 transition-all flex-shrink-0',
                      isActive
                        ? `bg-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.15)] border-l-2 ${org.borderColor} rounded-[10px] sm:rounded-[12px]`
                        : 'rounded-[10px] sm:rounded-[12px] hover:bg-white/50'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 sm:h-5 sm:w-5',
                        isActive ? org.activeColor : 'text-slate-600'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs sm:text-sm md:text-base whitespace-nowrap',
                        isActive
                          ? `${org.activeColor} font-semibold`
                          : 'text-slate-600 font-medium'
                      )}
                    >
                      {org.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Правая часть: кнопки действий */}
        <div className="hidden sm:flex flex-1 justify-end items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            asChild
            className="h-9 sm:h-11 px-3 sm:px-4 py-2 sm:py-3 bg-white border-[1.5px] border-slate-200 rounded-[10px] sm:rounded-[12px] gap-1 hover:bg-gray-50"
          >
            <Link href="/admin/schools/new">
              <AddCircleBold className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              <span className="hidden md:inline text-sm sm:text-base font-medium text-slate-600">
                Tashkilot qo'shish
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
