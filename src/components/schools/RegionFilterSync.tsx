'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { selectedRegion } = useRegion();

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegionFilterSync:19',message:'RegionFilterSync effect started',data:{pathname,selectedRegion:selectedRegion?.id,hasSelectedRegion:!!selectedRegion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Обновляем URL только если мы на странице /schools
    if (pathname !== '/schools') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegionFilterSync:25',message:'pathname is not /schools, exiting',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    if (!selectedRegion) {
      // Если область не выбрана, удаляем параметр region из URL
      const currentRegion = searchParams.get('region');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegionFilterSync:33',message:'no selectedRegion, checking currentRegion',data:{currentRegion,hasCurrentRegion:!!currentRegion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (currentRegion) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('region');
        const newUrl = params.toString() ? `/schools?${params.toString()}` : '/schools';
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegionFilterSync:40',message:'router.push removing region param',data:{newUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // router.push автоматически обновит useSearchParams в DistrictsLoader
        router.push(newUrl, { scroll: false });
      }
      return;
    }

    // Если область выбрана, добавляем её ID в URL
    const currentRegion = searchParams.get('region');
    const regionId = selectedRegion.id.toString();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegionFilterSync:53',message:'selectedRegion exists, comparing with currentRegion',data:{currentRegion,regionId,shouldUpdate:currentRegion !== regionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (currentRegion !== regionId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('region', regionId);
      const newUrl = `/schools?${params.toString()}`;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fcd63747-9f96-4dfa-bdcd-f4eb869a2f67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegionFilterSync:60',message:'router.push adding region param',data:{newUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // router.push автоматически обновит useSearchParams в DistrictsLoader
      router.push(newUrl, { scroll: false });
    }
  }, [selectedRegion, searchParams, router, pathname]);

  // Этот компонент не рендерит ничего
  return null;
}

