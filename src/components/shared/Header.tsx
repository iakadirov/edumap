import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Header компонент с навигацией и логотипом
 * 
 * Features:
 * - Логотип EduMap.uz
 * - Основная навигация: Главная, Школы, О проекте
 * - Мобильное меню (будет добавлено позже)
 * - Responsive дизайн
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">EduMap.uz</span>
        </Link>

        {/* Навигация для desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Главная
          </Link>
          <Link
            href="/schools"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Школы
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            О проекте
          </Link>
        </nav>

        {/* CTA кнопка */}
        <div className="flex items-center space-x-4">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/schools">Найти школу</Link>
          </Button>
          {/* Мобильное меню будет добавлено позже */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Открыть меню"
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
    </header>
  );
}

