'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SortSelect } from './SortSelect';
import type { SortOption } from '@/lib/supabase/queries';

/**
 * Клиентский компонент для управления сортировкой
 */
export function SortControl({ currentSort }: { currentSort?: SortOption }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'rating_desc') {
      // Удаляем параметр sort, если выбрано значение по умолчанию
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    router.push(`/schools?${params.toString()}`, { scroll: false });
  };

  return (
    <SortSelect
      value={currentSort || 'rating_desc'}
      onValueChange={handleSortChange}
    />
  );
}

