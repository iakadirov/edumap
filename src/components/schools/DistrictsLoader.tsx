'use client';

import { useEffect, useState } from 'react';
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
        
        setDistricts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading districts:', error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    }

    loadDistricts();
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

