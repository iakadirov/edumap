'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RegionSelector } from './RegionSelector';
import { RegionDialog } from './RegionDialog';
import { Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * Header компонент с навигацией и выбором области
 * 
 * Features:
 * - Логотип EduMap.uz
 * - Выбор области (RegionSelector)
 * - Основная навигация: Bog'chalar, Maktablar, Oliygohlar, Kurslar
 * - Кнопка "Maktab qo'shish"
 * - Модальное окно для первого выбора области
 */
export function Header() {
  const pathname = usePathname();

  // Определяем активную ссылку
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <RegionDialog />
      <header className="sticky top-0 z-50 w-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
        <div className="container-wrapper">
          <div className="container-content">
            <div className="container-inner">
              <div className="flex h-24 items-center justify-between px-0">
                {/* Левая часть: Логотип и выбор области */}
                <div className="flex items-center gap-12">
                  {/* Логотип */}
                  <Link href="/" className="flex items-center">
                    <div className="w-[133px] h-8 bg-[#1761FF] flex items-center justify-center rounded">
                      <span className="text-xl font-bold text-white">edumap</span>
                    </div>
                  </Link>

                  {/* Выбор области */}
                  <div className="hidden lg:block">
                    <RegionSelector />
                  </div>
                </div>

                {/* Центральная часть: Навигация */}
                <nav className="hidden md:flex items-center gap-8">
                  <Link
                    href="/kindergartens"
                    className={`text-[17px] leading-[22px] transition-colors ${
                      isActive('/kindergartens')
                        ? 'font-semibold text-black'
                        : 'font-medium text-black hover:text-primary'
                    }`}
                  >
                    Bog'chalar
                  </Link>
                  <Link
                    href="/schools"
                    className={`text-[17px] leading-[22px] transition-colors ${
                      isActive('/schools')
                        ? 'font-semibold text-black'
                        : 'font-medium text-black hover:text-primary'
                    }`}
                  >
                    Maktablar
                  </Link>
                  <Link
                    href="/universities"
                    className={`text-[17px] leading-[22px] transition-colors ${
                      isActive('/universities')
                        ? 'font-semibold text-black'
                        : 'font-medium text-black hover:text-primary'
                    }`}
                  >
                    Oliygohlar
                  </Link>
                  <Link
                    href="/courses"
                    className={`text-[17px] leading-[22px] transition-colors ${
                      isActive('/courses')
                        ? 'font-semibold text-black'
                        : 'font-medium text-black hover:text-primary'
                    }`}
                  >
                    Kurslar
                  </Link>
                </nav>

                {/* Правая часть: Кнопка добавления */}
                <div className="flex items-center gap-6">
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 px-4 rounded-2xl gap-2 border-2 border-[#D7E2F8] bg-white hover:bg-[#F3F6F8]"
                  >
                    <Link href="/schools/new">
                      <Plus className="h-6 w-6" />
                      <span className="text-[17px] font-medium leading-[22px] text-[#1A2438]">
                        Maktab qo'shish
                      </span>
                    </Link>
                  </Button>

                  {/* Мобильное меню */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Menuni ochish"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" x2="20" y1="12" y2="12" />
                      <line x1="4" x2="20" y1="6" y2="6" />
                      <line x1="4" x2="20" y1="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
