/**
 * Нормализация социальных сетей (Instagram, Facebook, YouTube)
 * Поддерживает различные форматы URL и username
 */

export interface SocialMediaData {
  username: string; // нормализованный username
  url: string; // полный URL
  display: string; // для отображения
}

/**
 * Нормализует Instagram username/URL
 * Поддерживает:
 * - @username
 * - https://instagram.com/username
 * - https://www.instagram.com/username
 * - https://instagram.com/@username
 * - username
 */
export function normalizeInstagram(input: string | null | undefined): SocialMediaData | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const cleanedInput = trimmed.replace(/\s+/g, '');

  const patterns = [
    // https://instagram.com/username или https://www.instagram.com/username
    /^https?:\/\/(?:www\.)?instagram\.com\/(?:@)?([a-zA-Z0-9._]+)/i,
    // @username
    /^@([a-zA-Z0-9._]+)/,
    // username (просто текст)
    /^([a-zA-Z0-9._]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleanedInput.match(pattern);
    if (match && match[1]) {
      const username = match[1].toLowerCase();
      return {
        username,
        url: `https://instagram.com/${username}`,
        display: `@${username}`,
      };
    }
  }

  return null;
}

/**
 * Нормализует Facebook username/URL
 * Принимает любой URL как есть (не валидирует строго)
 * Поддерживает:
 * - https://facebook.com/username
 * - https://www.facebook.com/profile.php?id=123456
 * - https://fb.com/username
 * - username
 * - Любой другой валидный URL Facebook
 */
export function normalizeFacebook(input: string | null | undefined): SocialMediaData | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const cleanedFb = trimmed.replace(/\s+/g, '');

  // Если это уже полный URL (начинается с http:// или https://), возвращаем как есть
  if (/^https?:\/\//i.test(cleanedFb)) {
    // Проверяем, что это URL Facebook
    if (/facebook\.com|fb\.com/i.test(cleanedFb)) {
      // Извлекаем username или ID из URL
      const usernameMatch = cleanedFb.match(/(?:facebook|fb)\.com\/([^/?]+)/i);
      const idMatch = cleanedFb.match(/profile\.php\?id=(\d+)/i);

      if (usernameMatch && usernameMatch[1]) {
        const username = usernameMatch[1];
        return {
          username,
          url: cleanedFb,
          display: username,
        };
      } else if (idMatch && idMatch[1]) {
        return {
          username: idMatch[1],
          url: cleanedFb,
          display: `ID: ${idMatch[1]}`,
        };
      } else {
        // Если не удалось извлечь username/ID, все равно возвращаем URL как есть
        return {
          username: cleanedFb,
          url: cleanedFb,
          display: cleanedFb,
        };
      }
    } else {
      // Если это не Facebook URL, все равно возвращаем как есть
      return {
        username: cleanedFb,
        url: cleanedFb,
        display: cleanedFb,
      };
    }
  }

  // Если это просто username (без http://), добавляем базовый URL
  if (/^[a-zA-Z0-9._-]+$/.test(cleanedFb)) {
    const url = `https://facebook.com/${cleanedFb}`;
    return {
      username: cleanedFb.toLowerCase(),
      url: url,
      display: cleanedFb,
    };
  }

  // Для любых других случаев возвращаем как есть, но гарантируем валидный URL
  let finalUrl = cleanedFb;
  if (!cleanedFb.startsWith('http://') && !cleanedFb.startsWith('https://')) {
    finalUrl = `https://${cleanedFb}`;
  }
  return {
    username: cleanedFb,
    url: finalUrl,
    display: cleanedFb,
  };
}

/**
 * Нормализует YouTube channel/URL
 * Поддерживает:
 * - https://youtube.com/@channel
 * - https://www.youtube.com/@channel
 * - https://youtube.com/channel/UC...
 * - https://www.youtube.com/c/channel
 * - @channel
 * - channel
 */
export function normalizeYouTube(input: string | null | undefined): SocialMediaData | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const cleanedYt = trimmed.replace(/\s+/g, '');

  const patterns = [
    // https://youtube.com/@channel
    /^https?:\/\/(?:www\.)?(?:youtube\.com\/@|youtu\.be\/)([a-zA-Z0-9_-]+)/i,
    // https://youtube.com/channel/UC... или /c/channel
    /^https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/|c\/)([a-zA-Z0-9_-]+)/i,
    // @channel
    /^@([a-zA-Z0-9_-]+)/,
    // channel (просто текст)
    /^([a-zA-Z0-9_-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleanedYt.match(pattern);
    if (match && match[1]) {
      const channel = match[1];
      // Убираем @ если есть, чтобы username был чистым
      const cleanChannel = channel.replace(/^@/, '');
      // Всегда используем формат @channel для отображения
      const displayChannel = `@${cleanChannel}`;
      return {
        username: cleanChannel, // Сохраняем без @
        url: `https://youtube.com/@${cleanChannel}`, // Всегда формат @username
        display: displayChannel,
      };
    }
  }

  return null;
}

/**
 * Сохраняет Instagram в нормализованном виде
 */
export function saveInstagram(input: string | null | undefined): string | null {
  const normalized = normalizeInstagram(input);
  return normalized ? normalized.username : null;
}

/**
 * Сохраняет Facebook в нормализованном виде (возвращает URL)
 */
export function saveFacebook(input: string | null | undefined): string | null {
  const normalized = normalizeFacebook(input);
  return normalized ? normalized.url : null;
}

/**
 * Сохраняет YouTube в нормализованном виде (возвращает URL)
 */
export function saveYouTube(input: string | null | undefined): string | null {
  const normalized = normalizeYouTube(input);
  return normalized ? normalized.url : null;
}

/**
 * Форматирует Instagram для отображения
 */
export function formatInstagramForDisplay(input: string | null | undefined): SocialMediaData | null {
  if (input && !input.startsWith('@') && !input.startsWith('http')) {
    const username = input.toLowerCase().replace(/^@/, '');
    if (/^[a-zA-Z0-9._]+$/.test(username)) {
      return {
        username,
        url: `https://instagram.com/${username}`,
        display: `@${username}`,
      };
    }
  }
  return normalizeInstagram(input);
}

/**
 * Форматирует Facebook для отображения
 */
export function formatFacebookForDisplay(input: string | null | undefined): SocialMediaData | null {
  if (input && !input.startsWith('http')) {
    const username = input.toLowerCase();
    if (/^[a-zA-Z0-9.]+$/.test(username)) {
      return {
        username,
        url: `https://facebook.com/${username}`,
        display: username,
      };
    }
  }
  return normalizeFacebook(input);
}

/**
 * Форматирует YouTube для отображения
 */
export function formatYouTubeForDisplay(input: string | null | undefined): SocialMediaData | null {
  if (input && !input.startsWith('@') && !input.startsWith('http')) {
    const channel = input.replace(/^@/, '');
    const displayChannel = `@${channel}`;
    return {
      username: channel,
      url: `https://youtube.com/@${channel}`, // Всегда формат @username
      display: displayChannel,
    };
  }
  return normalizeYouTube(input);
}

