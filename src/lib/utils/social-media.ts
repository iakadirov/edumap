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

  let cleaned = trimmed.replace(/\s+/g, '');

  const patterns = [
    // https://instagram.com/username или https://www.instagram.com/username
    /^https?:\/\/(?:www\.)?instagram\.com\/(?:@)?([a-zA-Z0-9._]+)/i,
    // @username
    /^@([a-zA-Z0-9._]+)/,
    // username (просто текст)
    /^([a-zA-Z0-9._]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
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
 * Поддерживает:
 * - https://facebook.com/username
 * - https://www.facebook.com/username
 * - https://fb.com/username
 * - username
 */
export function normalizeFacebook(input: string | null | undefined): SocialMediaData | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let cleaned = trimmed.replace(/\s+/g, '');

  const patterns = [
    // https://facebook.com/username или https://www.facebook.com/username
    /^https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/([a-zA-Z0-9.]+)/i,
    // username (просто текст)
    /^([a-zA-Z0-9.]+)$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const username = match[1].toLowerCase();
      return {
        username,
        url: `https://facebook.com/${username}`,
        display: username,
      };
    }
  }

  return null;
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

  let cleaned = trimmed.replace(/\s+/g, '');

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
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const channel = match[1];
      // Если это не начинается с @, добавляем @ для нового формата YouTube
      const displayChannel = channel.startsWith('@') ? channel : `@${channel}`;
      return {
        username: channel,
        url: `https://youtube.com/${displayChannel}`,
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
 * Сохраняет Facebook в нормализованном виде
 */
export function saveFacebook(input: string | null | undefined): string | null {
  const normalized = normalizeFacebook(input);
  return normalized ? normalized.username : null;
}

/**
 * Сохраняет YouTube в нормализованном виде
 */
export function saveYouTube(input: string | null | undefined): string | null {
  const normalized = normalizeYouTube(input);
  return normalized ? normalized.username : null;
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
    const channel = input;
    const displayChannel = channel.startsWith('@') ? channel : `@${channel}`;
    return {
      username: channel,
      url: `https://youtube.com/${displayChannel}`,
      display: displayChannel,
    };
  }
  return normalizeYouTube(input);
}

