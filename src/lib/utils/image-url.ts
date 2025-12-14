/**
 * Утилиты для работы с URL изображений из Yandex Cloud Storage
 */

/**
 * Извлекает ключ файла из presigned URL Yandex Cloud Storage
 * 
 * @param url - Presigned URL (например: "https://storage.yandexcloud.net/edumap/logos/123/logo.webp?X-Amz-...")
 * @returns Ключ файла (например: "logos/123/logo.webp") или null, если не удалось извлечь
 */
export function extractKeyFromPresignedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Извлекаем путь после bucket name
    // URL формат: https://storage.yandexcloud.net/bucket-name/key?params
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Первая часть - это bucket name, остальное - ключ
    if (pathParts.length < 2) {
      return null;
    }
    
    // Пропускаем bucket name и объединяем остальные части
    const key = pathParts.slice(1).join('/');
    return key;
  } catch {
    return null;
  }
}

/**
 * Проверяет, является ли URL presigned URL (содержит параметры X-Amz-*)
 */
export function isPresignedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.has('X-Amz-Algorithm') || urlObj.searchParams.has('X-Amz-Signature');
  } catch {
    return false;
  }
}

/**
 * Получает свежий presigned URL для изображения
 * 
 * @param urlOrKey - Старый presigned URL или ключ файла
 * @returns Новый presigned URL или исходный URL, если не удалось обновить
 */
export async function refreshImageUrl(urlOrKey: string): Promise<string> {
  try {
    // Извлекаем ключ из URL, если это presigned URL
    let key: string | null = null;
    
    if (isPresignedUrl(urlOrKey)) {
      key = extractKeyFromPresignedUrl(urlOrKey);
    } else {
      // Если это уже ключ, используем его напрямую
      key = urlOrKey;
    }
    
    if (!key) {
      // Если не удалось извлечь ключ, возвращаем исходный URL
      return urlOrKey;
    }
    
    // Запрашиваем новый presigned URL через API
    const response = await fetch('/api/images/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });
    
    if (!response.ok) {
      // Если запрос не удался, возвращаем исходный URL
      return urlOrKey;
    }
    
    const data = await response.json();
    return data.url || urlOrKey;
  } catch (error) {
    console.error('Failed to refresh image URL:', error);
    // В случае ошибки возвращаем исходный URL
    return urlOrKey;
  }
}
