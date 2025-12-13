'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRegion } from '@/contexts/RegionContext';

/**
 * Компонент для синхронизации выбранной области из RegionContext с URL
 * 
 * Когда пользователь выбирает область в Header, этот компонент обновляет URL
 * для фильтрации школ по выбранной области
 */
export function RegionFilterSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedRegion } = useRegion();

  useEffect(() => {
    if (!selectedRegion) {
      // Если область не выбрана, удаляем параметр region из URL
      const currentRegion = searchParams.get('region');
      if (currentRegion) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('region');
        router.replace(`/schools?${params.toString()}`, { scroll: false });
      }
      return;
    }

    // Если область выбрана, добавляем её ID в URL
    const currentRegion = searchParams.get('region');
    const regionId = selectedRegion.id.toString();

    if (currentRegion !== regionId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('region', regionId);
      router.replace(`/schools?${params.toString()}`, { scroll: false });
    }
  }, [selectedRegion, searchParams, router]);

  // Этот компонент не рендерит ничего
  return null;
}

