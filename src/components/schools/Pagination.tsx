'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      router.push(`/schools/list?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Генерируем номера страниц для отображения
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Показываем первую, последнюю и страницы вокруг текущей
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex flex-col items-center gap-4 py-8" aria-label="Sahifalar navigatsiyasi">
      {/* Информация о текущей странице */}
      <p className="text-sm text-muted-foreground">
        Sahifa <span className="font-medium text-foreground">{currentPage}</span> / {totalPages}
        <span className="mx-2">•</span>
        Jami: <span className="font-medium text-foreground">{totalCount}</span> ta maktab
      </p>

      {/* Кнопки пагинации */}
      <div className="flex items-center gap-1">
        {/* Первая страница */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateToPage(1)}
          disabled={!hasPrevPage}
          className="hidden sm:flex"
          aria-label="Birinchi sahifa"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Предыдущая страница */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={!hasPrevPage}
          aria-label="Oldingi sahifa"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Номера страниц */}
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                onClick={() => navigateToPage(pageNum)}
                disabled={isActive}
                className={isActive ? 'pointer-events-none' : ''}
                aria-label={`Sahifa ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Следующая страница */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Keyingi sahifa"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Последняя страница */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateToPage(totalPages)}
          disabled={!hasNextPage}
          className="hidden sm:flex"
          aria-label="Oxirgi sahifa"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
