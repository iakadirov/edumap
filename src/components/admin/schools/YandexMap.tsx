'use client';

import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapProps {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  height?: string;
  className?: string;
}

export function YandexMap({
  lat,
  lng,
  address: initialAddress,
  onCoordinatesChange,
  onAddressChange,
  height = '400px',
  className = '',
}: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const lastSearchedAddressRef = useRef<string | null>(null);
  const isUpdatingFromAddressRef = useRef(false);

  // Загружаем Яндекс.Карты
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

    if (!apiKey) {
      setError('Yandex Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    // Проверяем, не загружен ли уже скрипт
    if (window.ymaps) {
      window.ymaps.ready(() => {
        initMap();
      });
      return;
    }

    // Проверяем, не загружается ли уже скрипт
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existingScript) {
      // Если скрипт уже есть, ждем его загрузки
      const checkInterval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkInterval);
          window.ymaps.ready(() => {
            initMap();
          });
        }
      }, 100);
      
      return () => clearInterval(checkInterval);
    }

    // Загружаем скрипт Яндекс.Карт
    // lang=uz_UZ - узбекский язык
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=uz_UZ`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        initMap();
      });
    };
    script.onerror = () => {
      setError('Failed to load Yandex Maps');
      setIsLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Очистка при размонтировании
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Инициализация карты
  const initMap = () => {
    if (!mapRef.current || !window.ymaps) {
      return;
    }

    try {
      // Центр карты - Ташкент по умолчанию, или переданные координаты
      const center: [number, number] = lat && lng ? [lat, lng] : [41.311081, 69.279737];
      const zoom = lat && lng ? 15 : 12;

      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl', 'typeSelector'],
      });

      mapInstanceRef.current = map;

      // Если есть начальные координаты, ставим маркер
      if (lat && lng) {
        setMarker(lat, lng);
      }

      // Обработчик клика на карту
      map.events.add('click', (e: any) => {
        const coords = e.get('coords');
        const newLat = coords[0];
        const newLng = coords[1];
        
        setMarker(newLat, newLng);
        onCoordinatesChange(newLat, newLng);
        
        // Получаем адрес по координатам и обновляем поле адреса
        geocodeCoordinates(newLat, newLng);
      });

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize map');
      setIsLoading(false);
    }
  };

  // Установка маркера
  const setMarker = (markerLat: number, markerLng: number) => {
    if (!mapInstanceRef.current) return;

    // Удаляем старый маркер, если есть
    if (markerRef.current) {
      mapInstanceRef.current.geoObjects.remove(markerRef.current);
    }

    // Создаем новый маркер
    markerRef.current = new window.ymaps.Placemark(
      [markerLat, markerLng],
      {
        balloonContent: 'Местоположение школы',
      },
      {
        preset: 'islands#redIcon',
        draggable: true,
      }
    );

    // Добавляем маркер на карту
    mapInstanceRef.current.geoObjects.add(markerRef.current);

    // Центрируем карту на маркере
    mapInstanceRef.current.setCenter([markerLat, markerLng], 15);

    // Обработчик перетаскивания маркера
    markerRef.current.events.add('dragend', () => {
      const coords = markerRef.current.geometry.getCoordinates();
      const newLat = coords[0];
      const newLng = coords[1];
      
      onCoordinatesChange(newLat, newLng);
      // Получаем адрес по координатам и обновляем поле адреса
      geocodeCoordinates(newLat, newLng);
    });
  };

  // Геокодирование координат для получения адреса (обратное геокодирование)
  const geocodeCoordinates = async (geocodeLat: number, geocodeLng: number) => {
    if (!onAddressChange) return;

    setIsGeocoding(true);
    setGeocodingError(null);
    
    // Помечаем, что мы обновляем адрес из геокодирования, чтобы не искать его заново на карте
    isUpdatingFromAddressRef.current = true;
    
    try {
      // Используем встроенный геокодер из JavaScript API
      if (window.ymaps && typeof window.ymaps.geocode === 'function') {
        try {
          // Используем встроенный геокодер JavaScript API
          // Формат: ymaps.geocode([широта, долгота], {options})
          const res = await window.ymaps.geocode([geocodeLat, geocodeLng], {
            results: 1,
            lang: 'uz-UZ'
          });
          
          if (res && res.geoObjects && res.geoObjects.getLength() > 0) {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
              const address = firstGeoObject.getAddressLine();
              
              if (address) {
                // Обновляем адрес в поле
                onAddressChange(address);
                lastSearchedAddressRef.current = address;
                setIsGeocoding(false);
                // Сбрасываем флаг через небольшую задержку
                setTimeout(() => {
                  isUpdatingFromAddressRef.current = false;
                }, 500);
                return;
              }
            }
          }
          
          // Если встроенный геокодер не вернул адрес, пробуем через API
          await geocodeViaAPI(geocodeLat, geocodeLng);
        } catch (err: any) {
          console.warn('Built-in geocoder error, trying API fallback:', err);
          await geocodeViaAPI(geocodeLat, geocodeLng);
        }
      } else {
        // Fallback на наш API если JavaScript API геокодер недоступен
        await geocodeViaAPI(geocodeLat, geocodeLng);
      }
    } catch (err: any) {
      console.error('Geocoding error:', err);
      setGeocodingError('Не удалось получить адрес автоматически. Введите адрес вручную.');
      setIsGeocoding(false);
      isUpdatingFromAddressRef.current = false;
    }
  };

  // Геокодирование через наш API endpoint (fallback)
  const geocodeViaAPI = async (geocodeLat: number, geocodeLng: number) => {
    try {
      const response = await fetch(
        `/api/geocode?lat=${geocodeLat}&lng=${geocodeLng}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.message || 'Failed to geocode';
        
        console.error('Geocoding API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorData.details
        });
        
        // Показываем пользователю понятное сообщение об ошибке
        if (response.status === 403) {
          // 403 означает, что API ключ не имеет доступа к HTTP Геокодеру
          // Это нормально - встроенный геокодер JavaScript API должен работать
          const message = 'HTTP Геокодер недоступен. Попробуйте использовать встроенный геокодер или введите адрес вручную.';
          console.warn('⚠️', message, '- Встроенный геокодер должен работать, если он не сработал, введите адрес вручную');
          setGeocodingError(null); // Не показываем ошибку, так как это не критично
        } else {
          setGeocodingError('Не удалось получить адрес автоматически. Введите адрес вручную.');
        }
        
        return;
      }

      const data = await response.json();
      if (data.address && onAddressChange) {
        onAddressChange(data.address);
        lastSearchedAddressRef.current = data.address;
      } else {
        console.warn('Geocoding returned no address:', data);
      }
    } catch (err: any) {
      console.error('API geocoding error:', err);
      setGeocodingError('Ошибка при получении адреса. Введите адрес вручную.');
    } finally {
      setIsGeocoding(false);
      setTimeout(() => {
        isUpdatingFromAddressRef.current = false;
      }, 500);
    }
  };

  // Обновляем маркер при изменении координат извне
  useEffect(() => {
    if (lat && lng && mapInstanceRef.current && !isLoading) {
      setMarker(lat, lng);
    }
  }, [lat, lng, isLoading]);

  // Поиск адреса на карте при изменении поля адреса (с debounce)
  useEffect(() => {
    // Пропускаем если:
    // 1. Карта еще не загружена
    // 2. Адрес пустой
    // 3. Это тот же адрес, который мы уже искали
    // 4. Мы сейчас обновляем адрес из геокодирования (чтобы избежать циклов)
    if (
      !window.ymaps || 
      !mapInstanceRef.current || 
      isLoading ||
      !initialAddress || 
      !initialAddress.trim() ||
      initialAddress === lastSearchedAddressRef.current ||
      isUpdatingFromAddressRef.current
    ) {
      return;
    }

    // Debounce: ждем 800ms после последнего изменения адреса перед поиском
    // Ищем адрес даже если координаты уже есть (пользователь мог изменить адрес вручную)
    const timeoutId = setTimeout(() => {
      searchAddressOnMap(initialAddress);
    }, 800);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialAddress, isLoading]);

  // Поиск адреса на карте (прямое геокодирование)
  const searchAddressOnMap = async (addressQuery: string) => {
    if (!addressQuery.trim() || !window.ymaps || !mapInstanceRef.current) {
      return;
    }

    // Помечаем, что мы ищем этот адрес
    lastSearchedAddressRef.current = addressQuery;

    try {
      // Используем встроенный геокодер Yandex Maps для поиска адреса
      const geocoder = window.ymaps.geocode(addressQuery, {
        results: 1,
        lang: 'uz-UZ',
      });

      const results = await geocoder;
      
      if (results && results.geoObjects && results.geoObjects.getLength() > 0) {
        const firstGeoObject = results.geoObjects.get(0);
        const coords = firstGeoObject.geometry.getCoordinates();
        const foundLat = coords[0];
        const foundLng = coords[1];

        // Устанавливаем маркер на найденное место
        setMarker(foundLat, foundLng);
        
        // Обновляем координаты (но не обновляем адрес, чтобы избежать циклов)
        isUpdatingFromAddressRef.current = true;
        onCoordinatesChange(foundLat, foundLng);
        setTimeout(() => {
          isUpdatingFromAddressRef.current = false;
        }, 100);
      }
    } catch (err: any) {
      console.error('Address search error:', err);
      
      // Fallback: пробуем через API
      try {
        await searchAddressViaAPI(addressQuery);
      } catch (apiErr) {
        console.error('API search error:', apiErr);
      }
    }
  };

  // Поиск адреса через наш API (fallback)
  const searchAddressViaAPI = async (query: string) => {
    try {
      const response = await fetch(
        `/api/geocode/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('API search failed');
      }

      const data = await response.json();
      
      if (data.lat && data.lng) {
        setMarker(data.lat, data.lng);
        isUpdatingFromAddressRef.current = true;
        onCoordinatesChange(data.lat, data.lng);
        setTimeout(() => {
          isUpdatingFromAddressRef.current = false;
        }, 100);
      }
    } catch (err: any) {
      console.error('API search error:', err);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>📍 Укажите местоположение на карте</Label>
      <div className="relative rounded-[24px] overflow-hidden border border-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-sm text-muted-foreground">Загрузка карты...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
        {isGeocoding && (
          <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow text-xs text-muted-foreground z-20">
            Получение адреса...
          </div>
        )}
        {geocodingError && (
          <div className="absolute bottom-2 left-2 right-2 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded shadow text-xs text-yellow-800 z-20">
            {geocodingError}
          </div>
        )}
        <div
          ref={mapRef}
          style={{ width: '100%', height, minHeight: '300px' }}
          className="bg-gray-100"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Введите адрес в поле "Manzil" для поиска на карте или кликните на карте для автоматического заполнения адреса.
      </p>
      {geocodingError && (
        <p className="text-xs text-yellow-600 mt-1">
          ⚠️ {geocodingError}
        </p>
      )}
    </div>
  );
}

