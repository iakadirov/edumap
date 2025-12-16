import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint для обратного геокодирования через Яндекс.Карты
 * Получает адрес по координатам
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
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
    // Используем Яндекс.Геокодер API для обратного геокодирования
    // Формат: geocode=долгота,широта (обратите внимание на порядок!)
    // Используем HTTP Геокодер API
    // lang=uz_UZ - узбекский язык
    const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&geocode=${lng},${lat}&format=json&lang=uz_UZ&results=1&kind=house`;
    
    console.log('Geocoding request:', { 
      lat, 
      lng, 
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
      console.warn('No geo objects found for coordinates:', { lat, lng });
      return NextResponse.json(
        { error: 'Address not found for these coordinates' },
        { status: 404 }
      );
    }

    const geoObject = geoObjects[0].GeoObject;
    const address = geoObject.metaDataProperty?.GeocoderMetaData?.text || '';
    const addressDetails = geoObject.metaDataProperty?.GeocoderMetaData?.Address;

    // Извлекаем компоненты адреса
    const components = addressDetails?.Components || [];
    const city = components.find((c: any) => c.kind === 'locality')?.name || '';
    const district = components.find((c: any) => c.kind === 'district')?.name || '';
    const street = components.find((c: any) => c.kind === 'street')?.name || '';
    const house = components.find((c: any) => c.kind === 'house')?.name || '';

    return NextResponse.json({
      address: address,
      city: city,
      district: district,
      street: street,
      house: house,
      components: components,
    });
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to geocode coordinates' },
      { status: 500 }
    );
  }
}

