'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Search, X, Loader2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/utils';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
}

interface BrandSearchProps {
  value?: string | null;
  onChange: (brandId: string | null) => void;
  label?: string;
}

export function BrandSearch({ value, onChange, label = "Brend qo'shish (ixtiyoriy)" }: BrandSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Загружаем выбранный бренд при монтировании
  useEffect(() => {
    if (value) {
      fetchBrand(value);
    }
  }, [value]);

  // Закрываем результаты при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBrand = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands/${brandId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedBrand(data.brand);
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setBrands([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/brands/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    onChange(brand.id);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleRemoveBrand = () => {
    setSelectedBrand(null);
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2" ref={searchRef}>
      <Label className="flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        {label}
      </Label>
      
      {selectedBrand ? (
        <div className="flex items-center gap-3 p-3 border rounded-[24px] bg-muted/50">
          {selectedBrand.logo_url ? (
            <div className="relative w-10 h-10 rounded overflow-hidden">
              <OptimizedImage
                src={selectedBrand.logo_url}
                alt={selectedBrand.name}
                width={40}
                height={40}
                className="rounded object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium">{selectedBrand.name}</div>
            <div className="text-sm text-muted-foreground">@{selectedBrand.slug}</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveBrand}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (brands.length > 0) {
                  setShowResults(true);
                }
              }}
              placeholder="Brend nomi bo'yicha qidirish..."
              className="pl-9"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {showResults && brands.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-[12px] shadow-lg max-h-60 overflow-auto">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleSelectBrand(brand)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left",
                    "first:rounded-t-md last:rounded-b-md"
                  )}
                >
                  {brand.logo_url ? (
                    <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                      <OptimizedImage
                        src={brand.logo_url}
                        alt={brand.name}
                        width={32}
                        height={32}
                        className="rounded object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{brand.name}</div>
                    <div className="text-sm text-muted-foreground truncate">@{brand.slug}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {showResults && searchQuery.length >= 2 && !loading && brands.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-[12px] shadow-lg p-3 text-sm text-muted-foreground">
              Brend topilmadi
            </div>
          )}
        </div>
      )}
    </div>
  );
}

