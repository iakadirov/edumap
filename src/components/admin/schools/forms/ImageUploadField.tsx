'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  type: 'logo' | 'cover';
  previewSize: string;
}

/**
 * Компонент для загрузки изображений (логотип и баннер)
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  type,
  previewSize,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
    'image/gif',
  ];

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidMimeType = ALLOWED_TYPES.includes(file.type);
    const isSvgFile = fileExtension === 'svg' && file.type.startsWith('image/');
    const isValidType = isValidMimeType || isSvgFile;

    if (!isValidType) {
      setError('Faqat rasm fayllari: PNG, JPG, JPEG, SVG, WebP, GIF');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`Fayl juda katta. Maksimal: ${MAX_SIZE / 1024 / 1024}MB`);
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
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Fayl yuklanmadi');
      setPreview(value || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center',
          preview ? 'border-primary' : 'border-muted-foreground/25',
          previewSize
        )}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Fayl tanlash
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

