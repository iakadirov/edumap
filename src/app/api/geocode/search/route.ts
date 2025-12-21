import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint для прямого геокодирования через Яндекс.Карты
 * Получает координаты по адресу
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  const yandexApiKey = process.env.YANDEX_MAPS_API_KEY;

  if (!yandexApiKey) {
    return NextResponse.json(
      { error: 'Yandex Maps API key is not configured' },
      { status: 500 }
    );
  }

  try {
    // Используем Яндекс.Геокодер API для прямого геокодирования
    // Формат: geocode=адрес
    // lang=uz_UZ - узбекский язык
    const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&geocode=${encodeURIComponent(query)}&format=json&lang=uz_UZ&results=1`;
    
    console.log('Geocoding search request:', { 
      query,
      url: geocodeUrl.replace(yandexApiKey, '***'),
      hasApiKey: !!yandexApiKey 
    });

    const response = await fetch(geocodeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Yandex API error: ${response.status} ${response.statusText}`;
      
      // Пытаемся распарсить JSON ошибку
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Если не JSON, используем текст как есть
      }
      
      console.error('Yandex API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        message: errorMessage
      });
      
      // Специальная обработка для 403 - проблема с API ключом
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: 'API ключ не имеет доступа к Геокодеру. Убедитесь, что вы подключили "JavaScript API и HTTP Геокодер" в личном кабинете Яндекс.',
            details: errorText
          },
          { status: 403 }
        );
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('Yandex API response:', JSON.stringify(data, null, 2));

    // Проверяем наличие ошибок в ответе
    if (data.error) {
      console.error('Yandex API returned error:', data.error);
      return NextResponse.json(
        { error: data.error.message || 'Yandex API error' },
        { status: 400 }
      );
    }

    // Парсим ответ от Яндекс.Геокодера
    const geoObjects = data.response?.GeoObjectCollection?.featureMember;

    if (!geoObjects || geoObjects.length === 0) {
      console.warn('No geo objects found for query:', query);
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const geoObject = geoObjects[0].GeoObject;
    const coords = geoObject.Point?.pos;
    
    if (!coords) {
      return NextResponse.json(
        { error: 'Coordinates not found in response' },
        { status: 404 }
      );
    }

    // Формат координат: "долгота широта" (обратите внимание на порядок!)
    const [lng, lat] = coords.split(' ').map(Number);
    
    const address = geoObject.metaDataProperty?.GeocoderMetaData?.text || '';
    const addressDetails = geoObject.metaDataProperty?.GeocoderMetaData?.Address;

    // Извлекаем компоненты адреса
    const components = addressDetails?.Components || [];
    const city = components.find((c: any) => c.kind === 'locality')?.name || '';
    const district = components.find((c: any) => c.kind === 'district')?.name || '';
    const street = components.find((c: any) => c.kind === 'street')?.name || '';
    const house = components.find((c: any) => c.kind === 'house')?.name || '';

    return NextResponse.json({
      lat,
      lng,
      address: address,
      city: city,
      district: district,
      street: street,
      house: house,
      components: components,
    });
  } catch (error: any) {
    console.error('Geocoding search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to geocode address' },
      { status: 500 }
    );
  }
}

