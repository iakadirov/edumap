'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  MagniferBold,
  AddCircleBold,
} from '@solar-icons/react-perf';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Основная навигация Header для раздела школ
 * 
 * Features:
 * - Логотип
 * - Навигационные ссылки (Maktab tanlash, Ota-onalar uchun, Olimpiadalar)
 * - Поиск и кнопка входа
 */
export function SchoolsMainNav() {
  const pathname = usePathname();

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
            href="/schools"
            className={cn(
              'text-lg font-medium transition-colors',
              pathname.startsWith('/schools')
                ? 'text-black font-semibold'
                : 'text-black hover:text-blue-600'
            )}
          >
            Maktab tanlash
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

      {/* Правая часть: поиск и вход */}
      <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-gray-400 hover:text-gray-600"
          aria-label="Qidirish"
        >
          <MagniferBold className="h-5 w-5" />
        </Button>

        <Button
          asChild
          className="h-12 px-4 sm:px-5 py-3 bg-blue-600 hover:bg-blue-700 border-[1.5px] border-blue-600 rounded-2xl gap-1"
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

