'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Region {
  id: number;
  soato_id: number;
  name_uz: string;
  name_oz: string;
  name_ru: string;
}

interface RegionContextType {
  selectedRegion: Region | null;
  setSelectedRegion: (region: Region | null) => void;
  isLoading: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const REGION_STORAGE_KEY = 'edumap_selected_region';

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем сохраненную область при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REGION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedRegionState(parsed);
      }
    } catch (error) {
      console.error('Error loading saved region:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Сохраняем область при изменении
  const setSelectedRegion = useCallback((region: Region | null) => {
    setSelectedRegionState(region);
    if (region) {
      localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region));
    } else {
      localStorage.removeItem(REGION_STORAGE_KEY);
    }
  }, []);

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion, isLoading }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

