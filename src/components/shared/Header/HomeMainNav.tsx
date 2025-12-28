'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  AddCircleBold,
} from '@solar-icons/react-perf';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Основная навигация Header для главной страницы и общих разделов
 * 
 * Features:
 * - Логотип
 * - Навигационные ссылки
 * - Поиск и кнопка входа
 */
export function HomeMainNav() {
  const pathname = usePathname();

  // Определяем тип организации для адаптации текстов
  const getOrgType = () => {
    if (pathname.startsWith('/kindergartens')) return 'kindergartens';
    if (pathname.startsWith('/schools')) return 'schools';
    if (pathname.startsWith('/universities')) return 'universities';
    if (pathname.startsWith('/courses')) return 'courses';
    return null;
  };

  const orgType = getOrgType();

  // Адаптируем тексты в зависимости от типа организации
  const getSelectText = () => {
    switch (orgType) {
      case 'kindergartens':
        return "Bog'cha tanlash";
      case 'schools':
        return 'Maktab tanlash';
      case 'universities':
        return 'Oliygoh tanlash';
      case 'courses':
        return 'Kurs tanlash';
      default:
        return 'Maktab tanlash';
    }
  };

  const getSelectHref = () => {
    switch (orgType) {
      case 'kindergartens':
        return '/kindergartens';
      case 'schools':
        return '/schools';
      case 'universities':
        return '/universities';
      case 'courses':
        return '/courses';
      default:
        return '/schools';
    }
  };

  return (
    <>
      {/* Левая часть: логотип и навигация */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
        {/* Логотип */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/logo.svg"
            alt="EduMap.uz"
            width={128}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Основная навигация */}
        <nav className="flex flex-wrap items-center gap-4 sm:gap-8">
          <Link
            href={getSelectHref()}
            className={cn(
              'text-lg font-medium transition-colors',
              pathname.startsWith(getSelectHref())
                ? 'text-black font-semibold'
                : 'text-black hover:text-blue-600'
            )}
          >
            {getSelectText()}
          </Link>
          <Link
            href="/parents"
            className={cn(
              'text-lg font-medium transition-colors',
              pathname.startsWith('/parents')
                ? 'text-black font-semibold'
                : 'text-black hover:text-blue-600'
            )}
          >
            Ota-onalar uchun
          </Link>
          <Link
            href="/olympiads"
            className={cn(
              'text-lg font-medium transition-colors',
              pathname.startsWith('/olympiads')
                ? 'text-black font-semibold'
                : 'text-black hover:text-blue-600'
            )}
          >
            Olimpiadalar
          </Link>
        </nav>
      </div>

      {/* Правая часть: вход */}
      <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto justify-end">
        <Button
          asChild
          className="h-12 px-4 sm:px-5 py-3 bg-blue-600 hover:bg-blue-700 border-[1.5px] border-blue-600 rounded-[12px] gap-1"
        >
          <Link href="/auth/login">
            <AddCircleBold className="h-6 w-6 text-white" />
            <span className="text-base font-semibold text-white">
              Kirish
            </span>
          </Link>
        </Button>
      </div>
    </>
  );
}

