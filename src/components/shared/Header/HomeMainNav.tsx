'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  AddCircleBold,
  HamburgerMenuLinear,
  CloseCircleBold,
} from '@solar-icons/react-perf';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * Основная навигация Header для главной страницы и общих разделов
 *
 * Features:
 * - Логотип
 * - Навигационные ссылки
 * - Мобильное меню (hamburger)
 * - Кнопка входа
 */
export function HomeMainNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { href: getSelectHref(), label: getSelectText() },
    { href: '/parents', label: 'Ota-onalar uchun' },
    { href: '/olympiads', label: 'Olimpiadalar' },
  ];

  return (
    <>
      {/* Логотип */}
      <Link href="/" className="flex items-center flex-shrink-0">
        <Image
          src="/images/logo/logo.svg"
          alt="EduMap.uz"
          width={128}
          height={32}
          className="h-7 sm:h-8 w-auto"
          priority
        />
      </Link>

      {/* Desktop навигация */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-base lg:text-lg font-medium transition-colors whitespace-nowrap',
              pathname.startsWith(link.href)
                ? 'text-black font-semibold'
                : 'text-black hover:text-blue-600'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Правая часть - ml-auto для выравнивания справа */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        {/* Кнопка входа - скрыта на мобильных, показана в меню */}
        <Button
          asChild
          className="hidden sm:flex h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-5 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 border-[1.5px] border-blue-600 rounded-[10px] sm:rounded-[12px] gap-1"
        >
          <Link href="/auth/login">
            <AddCircleBold className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <span className="text-sm sm:text-base font-semibold text-white">
              Kirish
            </span>
          </Link>
        </Button>

        {/* Hamburger menu button - только на мобильных */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Yopish' : 'Menyu'}
        >
          {isMobileMenuOpen ? (
            <CloseCircleBold className="h-6 w-6 text-slate-700" />
          ) : (
            <HamburgerMenuLinear className="h-6 w-6 text-slate-700" />
          )}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden fixed top-0 right-0 h-full w-[280px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-lg font-semibold text-slate-800">Menyu</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CloseCircleBold className="h-6 w-6 text-slate-700" />
          </Button>
        </div>

        {/* Mobile navigation links */}
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-xl text-base font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-700 hover:bg-gray-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile login button */}
        <div className="p-4 border-t border-gray-100">
          <Button
            asChild
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl gap-2"
          >
            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <AddCircleBold className="h-5 w-5 text-white" />
              <span className="text-base font-semibold text-white">
                Kirish
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
