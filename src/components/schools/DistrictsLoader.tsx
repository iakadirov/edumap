'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { DistrictMultiSelect } from './filters/DistrictMultiSelect';

interface DistrictOption {
  id: string;
  name: string;
  name_uz: string;
  count?: number;
}

interface DistrictsLoaderProps {
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

/**
 * Компонент для загрузки районов на клиенте с учетом выбранной области
 * Реактивно обновляется при изменении области
 */
export function DistrictsLoader({ selected, onSelectionChange }: DistrictsLoaderProps) {
  const searchParams = useSearchParams();
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [loading, setLoading] = useState(true);
  const prevRegionIdRef = useRef<string | null>(null);

  const regionId = searchParams.get('region');

  useEffect(() => {
    async function loadDistricts() {
      setLoading(true);
      try {
        const regionIdNum = regionId ? parseInt(regionId, 10) : null;
        const url = `/api/districts${regionIdNum ? `?region=${regionIdNum}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch districts');
        }
        
        const data = await response.json();
        
        // Проверяем на ошибку
        if (data.error) {
          throw new Error(data.message || data.error);
        }
        
        // API возвращает массив районов напрямую
        const districtsArray = Array.isArray(data) ? data : [];
        setDistricts(districtsArray);
        
        // Если область изменилась, сбрасываем выбранные районы
        // так как они могут не принадлежать новой области
        if (prevRegionIdRef.current !== null && prevRegionIdRef.current !== regionId) {
          // Проверяем, что выбранные районы существуют в новом списке
          const validSelected = selected.filter(id => 
            districtsArray.some(d => d.id.toString() === id)
          );
          if (validSelected.length !== selected.length) {
            onSelectionChange(validSelected);
          }
        }
        
        prevRegionIdRef.current = regionId;
      } catch (error) {
        console.error('Error loading districts:', error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    }

    loadDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Tuman</label>
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <DistrictMultiSelect
      options={districts}
      selected={selected}
      onSelectionChange={onSelectionChange}
      placeholder="Barcha tumanlar"
    />
  );
}

