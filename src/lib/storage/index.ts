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
  getS3Client,
  getBucketName,
  type UploadFileOptions,
  type FileInfo,
} from './yandex-client';

