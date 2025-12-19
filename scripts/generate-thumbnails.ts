#!/usr/bin/env tsx
/**
 * Скрипт для генерации thumbnail версий для существующих изображений
 * 
 * Использование:
 *   npx tsx scripts/generate-thumbnails.ts
 *   npx tsx scripts/generate-thumbnails.ts --prefix logos/
 *   npx tsx scripts/generate-thumbnails.ts --prefix covers/ --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@/lib/supabase/server';
import { 
  downloadFile, 
  fileExists, 
  listFiles,
} from '@/lib/storage';
import { 
  createAndUploadThumbnail,
} from '@/lib/storage/image-processor';
import { 
  getThumbnailKey, 
  isThumbnailKey,
} from '@/lib/utils/image-thumbnail';
import { isPresignedUrl, extractKeyFromPresignedUrl } from '@/lib/utils/image-url';

interface ImageInfo {
  key: string;
  type: 'logo' | 'cover';
  organizationId?: string;
}

/**
 * Извлекает ключ из URL или возвращает ключ как есть
 */
function extractKeyFromUrl(urlOrKey: string): string | null {
  if (isPresignedUrl(urlOrKey)) {
    return extractKeyFromPresignedUrl(urlOrKey);
  }
  
  // Если это уже ключ (начинается с logos/ или covers/)
  if (urlOrKey.startsWith('logos/') || urlOrKey.startsWith('covers/')) {
    return urlOrKey;
  }
  
  return null;
}

/**
 * Определяет тип изображения по ключу
 */
function getImageType(key: string): 'logo' | 'cover' | null {
  if (key.startsWith('logos/')) return 'logo';
  if (key.startsWith('covers/')) return 'cover';
  return null;
}

/**
 * Получает список изображений из БД
 */
async function getImagesFromDatabase(): Promise<ImageInfo[]> {
  const supabase = await createClient();
  const images: ImageInfo[] = [];

  // Получаем все организации с логотипами и баннерами
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('id, logo_url, cover_image_url');

  if (error) {
    console.error('Ошибка получения организаций:', error);
    return images;
  }

  for (const org of organizations || []) {
    // Обрабатываем логотип
    if (org.logo_url) {
      const key = extractKeyFromUrl(org.logo_url);
      if (key && getImageType(key) === 'logo') {
        images.push({
          key,
          type: 'logo',
          organizationId: org.id,
        });
      }
    }

    // Обрабатываем баннер
    if (org.cover_image_url) {
      const key = extractKeyFromUrl(org.cover_image_url);
      if (key && getImageType(key) === 'cover') {
        images.push({
          key,
          type: 'cover',
          organizationId: org.id,
        });
      }
    }
  }

  return images;
}

/**
 * Получает список изображений из storage по префиксу
 */
async function getImagesFromStorage(prefix: string): Promise<ImageInfo[]> {
  const files = await listFiles(prefix);
  const images: ImageInfo[] = [];

  for (const fileKey of files) {
    // Пропускаем thumbnail версии
    if (isThumbnailKey(fileKey)) {
      continue;
    }

    // Пропускаем не изображения
    const type = getImageType(fileKey);
    if (!type) {
      continue;
    }

    images.push({
      key: fileKey,
      type,
    });
  }

  return images;
}

async function main() {
  const args = process.argv.slice(2);
  const prefixArg = args.find((arg) => arg.startsWith('--prefix'));
  const dryRun = args.includes('--dry-run');

  let prefix: string | undefined;
  if (prefixArg) {
    prefix = prefixArg.split('=')[1];
  }

  console.log('\n🖼️  Генерация thumbnail версий для существующих изображений\n');
  console.log('─'.repeat(80));

  if (dryRun) {
    console.log('⚠️  Режим DRY RUN - изменения не будут сохранены\n');
  }

  let images: ImageInfo[] = [];

  if (prefix) {
    console.log(`📁 Получение изображений из storage с префиксом: ${prefix}\n`);
    images = await getImagesFromStorage(prefix);
  } else {
    console.log('📁 Получение изображений из базы данных...\n');
    images = await getImagesFromDatabase();
  }

  if (images.length === 0) {
    console.log('❌ Изображения не найдены\n');
    return;
  }

  console.log(`✅ Найдено изображений: ${images.length}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const thumbnailKey = getThumbnailKey(image.key);

    console.log(`\n[${i + 1}/${images.length}] Обработка: ${image.key}`);

    // Проверяем, существует ли уже thumbnail
    const thumbnailExists = await fileExists(thumbnailKey);
    if (thumbnailExists) {
      console.log(`   ⏭️  Thumbnail уже существует: ${thumbnailKey}`);
      skipCount++;
      continue;
    }

    // Проверяем, существует ли оригинальный файл
    const originalExists = await fileExists(image.key);
    if (!originalExists) {
      console.log(`   ⚠️  Оригинальный файл не найден в storage`);
      errorCount++;
      continue;
    }

    try {
      if (dryRun) {
        console.log(`   🔍 [DRY RUN] Будет создан thumbnail: ${thumbnailKey}`);
        successCount++;
      } else {
        // Скачиваем оригинальный файл
        console.log(`   ⬇️  Скачивание оригинального файла...`);
        const originalBuffer = await downloadFile(image.key);

        // Создаем thumbnail
        console.log(`   🎨 Создание thumbnail версии...`);
        await createAndUploadThumbnail(originalBuffer, image.key, image.type);

        console.log(`   ✅ Thumbnail создан: ${thumbnailKey}`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Ошибка при создании thumbnail:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('\n📊 Результаты:');
  console.log(`   ✅ Успешно: ${successCount}`);
  console.log(`   ⏭️  Пропущено (уже существует): ${skipCount}`);
  console.log(`   ❌ Ошибок: ${errorCount}`);
  console.log(`   📦 Всего обработано: ${images.length}\n`);
}

main().catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});

