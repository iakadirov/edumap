/**
 * Yandex Cloud Storage utilities
 * 
 * Экспорт всех функций для работы с файловым хранилищем
 */

export {
  uploadFile,
  getFileUrl,
  deleteFile,
  fileExists,
  getFileInfo,
  getLogoPath,
  getGalleryImagePath,
  getLicensePath,
  getDocumentPath,
  getTempPath,
  s3Client,
  BUCKET_NAME,
  type UploadFileOptions,
  type FileInfo,
} from './yandex-client';

