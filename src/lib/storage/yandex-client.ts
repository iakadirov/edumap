import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Функция для создания клиента Yandex Cloud Storage
// Yandex Object Storage совместим с S3 API
function createS3Client() {
  const accessKeyId = process.env.YANDEX_CLOUD_ACCESS_KEY_ID;
  const secretAccessKey = process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Yandex Cloud Storage credentials not configured. Please set YANDEX_CLOUD_ACCESS_KEY_ID and YANDEX_CLOUD_SECRET_ACCESS_KEY in environment variables.');
  }

  const endpoint = process.env.YANDEX_CLOUD_ENDPOINT || 'https://storage.yandexcloud.net';
  const region = process.env.YANDEX_CLOUD_REGION || 'ru-central1';

  // Для Yandex Cloud лучше использовать path-style URLs с общим endpoint
  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Yandex Cloud требует path-style URLs (storage.yandexcloud.net/bucket/key)
    forcePathStyle: true,
  });
}

// Lazy initialization клиента
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  // Всегда создаем новый клиент, чтобы избежать проблем с кэшированием
  // при изменении переменных окружения
  return createS3Client();
}

// Функция для получения имени bucket (для lazy evaluation)
function getBucketName(): string {
  return process.env.YANDEX_CLOUD_BUCKET_NAME || 'edumap-media';
}

export interface UploadFileOptions {
  key: string; // Путь к файлу в bucket (например: 'logos/123/logo.jpg')
  file: Buffer | Uint8Array | string; // Содержимое файла
  contentType: string; // MIME тип (например: 'image/jpeg')
  metadata?: Record<string, string>; // Дополнительные метаданные
}

export interface FileInfo {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag?: string;
}

/**
 * Загрузка файла в Yandex Cloud Storage
 */
export async function uploadFile(options: UploadFileOptions): Promise<string> {
  const { key, file, contentType, metadata } = options;

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
  });

  await getS3Client().send(command);

  // Возвращаем ключ файла для сохранения в БД
  return key;
}

/**
 * Получение публичного URL файла (если bucket публичный)
 * Или создание presigned URL для временного доступа
 */
export async function getFileUrl(
  key: string,
  expiresIn: number = 3600 // Время жизни URL в секундах (по умолчанию 1 час)
): Promise<string> {
  // Если bucket публичный, можно вернуть прямой URL
  // const publicUrl = `${process.env.YANDEX_CLOUD_ENDPOINT}/${BUCKET_NAME}/${key}`;
  // return publicUrl;

  // Для приватного bucket используем presigned URL
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  const url = await getSignedUrl(getS3Client(), command, { expiresIn });
  return url;
}

/**
 * Удаление файла из хранилища
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  await getS3Client().send(command);
}

/**
 * Проверка существования файла
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    });

    await getS3Client().send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Получение информации о файле
 */
export async function getFileInfo(key: string): Promise<FileInfo | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      key,
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
      etag: response.ETag,
    };
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Генерация пути для файла логотипа организации
 */
export function getLogoPath(organizationId: number | string, extension: string = 'jpg'): string {
  return `logos/${organizationId}/logo.${extension}`;
}

/**
 * Генерация пути для файла галереи организации
 */
export function getGalleryImagePath(
  organizationId: number | string,
  imageIndex: number,
  extension: string = 'jpg'
): string {
  return `galleries/${organizationId}/image_${imageIndex}.${extension}`;
}

/**
 * Генерация пути для документа лицензии
 */
export function getLicensePath(organizationId: number | string, extension: string = 'pdf'): string {
  return `licenses/${organizationId}/license.${extension}`;
}

/**
 * Генерация пути для документа организации
 */
export function getDocumentPath(
  organizationId: number | string,
  documentName: string,
  extension: string = 'pdf'
): string {
  const sanitizedName = documentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `documents/${organizationId}/${sanitizedName}.${extension}`;
}

/**
 * Генерация пути для временного файла
 */
export function getTempPath(uploadId: string, fileName: string): string {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `temp/${uploadId}/${sanitizedFileName}`;
}

export { getS3Client, getBucketName };

