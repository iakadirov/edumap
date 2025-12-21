'use client';

import { useState, useEffect } from 'react';

interface Region {
  id: number;
  name: string;
  name_uz?: string;
  name_ru?: string;
}

interface District {
  id: number;
  name: string;
  name_uz?: string;
  name_ru?: string;
  region_id: number;
}

interface UseRegionDistrictOptions {
  initialRegionId?: number | null;
  initialDistrictId?: number | null;
  onRegionChange?: (regionId: number | null) => void;
  onDistrictChange?: (districtId: number | null) => void;
}

interface UseRegionDistrictReturn {
  regions: Region[];
  districts: District[];
  loadingRegions: boolean;
  loadingDistricts: boolean;
  selectedRegionId: number | null;
  selectedDistrictId: number | null;
  setSelectedRegionId: (regionId: number | null) => void;
  setSelectedDistrictId: (districtId: number | null) => void;
  error: string | null;
}

/**
 * Хук для работы с регионами и районами
 * 
 * @example
 * ```tsx
 * const {
 *   regions,
 *   districts,
 *   loadingRegions,
 *   loadingDistricts,
 *   selectedRegionId,
 *   selectedDistrictId,
 *   setSelectedRegionId,
 *   setSelectedDistrictId,
 * } = useRegionDistrict({
 *   initialRegionId: 1,
 *   onRegionChange: (id) => console.log('Region changed:', id),
 * });
 * ```
 */
export function useRegionDistrict(
  options: UseRegionDistrictOptions = {}
): UseRegionDistrictReturn {
  const {
    initialRegionId = null,
    initialDistrictId = null,
    onRegionChange,
    onDistrictChange,
  } = options;

  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(initialRegionId);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(initialDistrictId);
  const [error, setError] = useState<string | null>(null);

  // Загружаем регионы при монтировании
  useEffect(() => {
    const loadRegions = async () => {
      setLoadingRegions(true);
      setError(null);
      try {
        const response = await fetch('/api/regions');
        if (!response.ok) {
          throw new Error('Failed to load regions');
        }
        const data = await response.json();
        const regionsList = Array.isArray(data) ? data : [];
        setRegions(regionsList);
      } catch (err) {
        console.error('Error loading regions:', err);
        setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
      } finally {
        setLoadingRegions(false);
      }
    };

    loadRegions();
  }, []);

  // Загружаем районы при изменении региона
  useEffect(() => {
    if (selectedRegionId) {
      setLoadingDistricts(true);
      setError(null);
      fetch(`/api/districts?region=${selectedRegionId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to load districts');
          }
          return res.json();
        })
        .then((responseData) => {
          const districtsList = Array.isArray(responseData) ? responseData : [];
          setDistricts(districtsList);
          // Сбрасываем район, если он не принадлежит новому региону
          if (selectedDistrictId && !districtsList.some((d) => d.id === selectedDistrictId)) {
            setSelectedDistrictId(null);
            onDistrictChange?.(null);
          }
        })
        .catch((err) => {
          console.error('Error loading districts:', err);
          setError(err.message || 'Xatolik yuz berdi');
          setDistricts([]);
        })
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
      if (selectedDistrictId) {
        setSelectedDistrictId(null);
        onDistrictChange?.(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegionId]);

  const handleSetRegionId = (regionId: number | null) => {
    setSelectedRegionId(regionId);
    onRegionChange?.(regionId);
  };

  const handleSetDistrictId = (districtId: number | null) => {
    setSelectedDistrictId(districtId);
    onDistrictChange?.(districtId);
  };

  return {
    regions,
    districts,
    loadingRegions,
    loadingDistricts,
    selectedRegionId,
    selectedDistrictId,
    setSelectedRegionId: handleSetRegionId,
    setSelectedDistrictId: handleSetDistrictId,
    error,
  };
}

