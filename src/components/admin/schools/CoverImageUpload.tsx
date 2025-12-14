'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CoverImageUploadProps {
  organizationId: string;
  currentCoverUrl?: string | null;
  onUploadSuccess: (url: string, key: string) => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Компонент для загрузки обложки школы
 * 
 * Поддерживаемые форматы: PNG, JPG, JPEG, SVG, WebP, GIF, BMP, TIFF, ICO
 * Максимальный размер: 10MB
 */
export function CoverImageUpload({
  organizationId,
  currentCoverUrl,
  onUploadSuccess,
  onRemove,
  className,
}: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentCoverUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Поддержка всех популярных форматов изображений
  const ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/x-ms-bmp',
    'image/pjpeg', // Альтернативный MIME для JPEG
    'image/x-png', // Альтернативный MIME для PNG
  ];

  // Разрешенные расширения файлов (для дополнительной проверки)
  const ALLOWED_EXTENSIONS = [
    'png',
    'jpg',
    'jpeg',
    'svg',
    'webp',
    'gif',
    'bmp',
    'tiff',
    'tif',
    'ico',
    'jfif', // JPEG File Interchange Format
    'pjpeg', // Progressive JPEG
  ];

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Проверка типа файла по MIME типу
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidMimeType = ALLOWED_TYPES.includes(file.type);
    const isValidExtension = fileExtension && ALLOWED_EXTENSIONS.includes(fileExtension);
    
    // Для SVG некоторые браузеры могут отправлять разные MIME типы
    const isSvgFile = fileExtension === 'svg' && file.type.startsWith('image/');
    
    // Проверяем, что файл является изображением
    const isValidType = isValidMimeType || isSvgFile || (isValidExtension && file.type.startsWith('image/'));

    if (!isValidType) {
      setError(
        `Неподдерживаемый формат. Разрешены: PNG, JPG, JPEG, SVG, WebP, GIF, BMP, TIFF, ICO`
      );
      return;
    }

    // Проверка размера
    if (file.size > MAX_SIZE) {
      setError(`Файл слишком большой. Максимальный размер: ${MAX_SIZE / 1024 / 1024}MB`);
      return;
    }

    // Показываем preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'cover');
      formData.append('organizationId', organizationId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка загрузки файла');
      }

      const data = await response.json();
      setPreview(data.url);
      onUploadSuccess(data.url, data.key);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить файл');
      setPreview(currentCoverUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Обложка школы</Label>
      
      <div className="flex flex-col gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative w-full h-64 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            <Image
              src={preview}
              alt="Обложка школы"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Удалить обложку"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif,image/bmp,image/tiff,image/x-icon,image/vnd.microsoft.icon,image/x-ms-bmp,image/pjpeg,image/x-png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : preview ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Заменить обложку
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Загрузить обложку
              </>
            )}
          </Button>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Форматы: PNG, JPG, JPEG, SVG, WebP, GIF, BMP, TIFF, ICO. Максимум 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
