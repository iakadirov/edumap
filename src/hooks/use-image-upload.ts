'use client';

import { useState, useRef } from 'react';

interface UseImageUploadOptions {
  type?: 'logo' | 'cover';
  maxSize?: number; // в байтах
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  uploading: boolean;
  error: string | null;
  preview: string | null;
  uploadFile: (file: File) => Promise<void>;
  removeFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

/**
 * Хук для загрузки изображений
 * 
 * @example
 * ```tsx
 * const { uploading, error, preview, uploadFile, removeFile, fileInputRef, handleFileSelect } = useImageUpload({
 *   type: 'logo',
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   onSuccess: (url) => console.log('Uploaded:', url),
 *   onError: (error) => console.error('Error:', error),
 * });
 * ```
 */
export function useImageUpload(
  initialValue?: string,
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const {
    type = 'logo',
    maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
    allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml',
      'image/webp',
      'image/gif',
    ],
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Валидация типа файла
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidMimeType = allowedTypes.includes(file.type);
      const isSvgFile = fileExtension === 'svg' && file.type.startsWith('image/');
      const isValidType = isValidMimeType || isSvgFile;

      if (!isValidType) {
        const errorMsg = `Faqat rasm fayllari: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Валидация размера
      if (file.size > maxSize) {
        const errorMsg = `Fayl juda katta. Maksimal: ${Math.round(maxSize / 1024 / 1024)}MB`;
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      // Загрузка файла
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fayl yuklashda xatolik');
      }

      const data = await response.json();
      setPreview(data.url);
      onSuccess?.(data.url);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Fayl yuklanmadi';
      setError(errorMsg);
      setPreview(initialValue || null);
      onError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Показываем preview перед загрузкой
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл
    await uploadFile(file);
  };

  const removeFile = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    uploading,
    error,
    preview,
    uploadFile,
    removeFile,
    fileInputRef,
    handleFileSelect,
  };
}

