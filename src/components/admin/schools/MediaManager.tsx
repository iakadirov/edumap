'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressIndicator } from './ProgressIndicator';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  category?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
}

interface MediaManagerProps {
  schoolId: string;
  type: 'photo' | 'video';
  categories?: string[];
  currentProgress?: number;
}

const PHOTO_CATEGORIES = [
  { value: 'exterior', label: 'Здание и территория' },
  { value: 'classrooms', label: 'Классы и кабинеты' },
  { value: 'labs', label: 'Лаборатории' },
  { value: 'sports', label: 'Спорт' },
  { value: 'cafeteria', label: 'Столовая' },
  { value: 'events', label: 'Мероприятия' },
  { value: 'library', label: 'Библиотека' },
];

export function MediaManager({
  schoolId,
  type,
  categories = PHOTO_CATEGORIES.map((c) => c.value),
  currentProgress = 0,
}: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);

  const [editCategory, setEditCategory] = useState('');
  const [editCaption, setEditCaption] = useState('');

  useEffect(() => {
    loadMedia();
  }, [schoolId, type]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/media?type=${type}`);
      const data = await response.json();
      if (response.ok) {
        setMedia(data.media || []);
      } else {
        setError(data.error || 'Failed to load media');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        // Загружаем файл на сервер
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type === 'photo' ? 'gallery' : 'document');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Upload failed');
        }

        // Сохраняем медиа в БД
        const mediaResponse = await fetch(`/api/admin/schools/${schoolId}/media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: uploadData.url,
            type,
            category: type === 'photo' ? categories[0] : undefined,
            sort_order: media.length,
          }),
        });

        if (!mediaResponse.ok) {
          throw new Error('Failed to save media');
        }
      }

      await loadMedia();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Сбрасываем input
      e.target.value = '';
    }
  };

  const handleSetCover = async (mediaId: string) => {
    try {
      const response = await fetch(
        `/api/admin/schools/${schoolId}/media/${mediaId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_cover: true }),
        }
      );

      if (response.ok) {
        await loadMedia();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set cover');
    }
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/schools/${schoolId}/media/${mediaToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        await loadMedia();
        setDeleteDialogOpen(false);
        setMediaToDelete(null);
      } else {
        setError('Failed to delete media');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete media');
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setEditCategory(item.category || '');
    setEditCaption(item.caption || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    try {
      const response = await fetch(
        `/api/admin/schools/${schoolId}/media/${editingMedia.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: editCategory || null,
            caption: editCaption || null,
          }),
        }
      );

      if (response.ok) {
        await loadMedia();
        setEditDialogOpen(false);
        setEditingMedia(null);
      } else {
        setError('Failed to update media');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update media');
    }
  };

  const groupedMedia = media.reduce((acc, item) => {
    const category = item.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  const coverMedia = media.find((m) => m.is_cover);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                {type === 'photo' ? '🖼 Фотографии' : '🎥 Видео'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {media.length} {type === 'photo' ? 'фото' : 'видео'}
              </p>
            </div>
            <div className="text-right">
              <ProgressIndicator value={currentProgress} showLabel={false} />
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-4">
            <Label htmlFor={`file-upload-${type}`} className="cursor-pointer">
              <span>
                <Button variant="outline" disabled={uploading} type="button">
                  {uploading ? 'Загрузка...' : `+ Загрузить ${type === 'photo' ? 'фото' : 'видео'}`}
                </Button>
              </span>
            </Label>
            <Input
              id={`file-upload-${type}`}
              type="file"
              accept={type === 'photo' ? 'image/*' : 'video/*'}
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Cover Photo */}
      {type === 'photo' && coverMedia && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">⭐ Обложка (отображается в карточке)</h3>
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-primary">
              <OptimizedImage
                src={coverMedia.url}
                alt={coverMedia.caption || 'Cover'}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(coverMedia)}
                >
                  ✏️ Редактировать
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped Media */}
      {Object.entries(groupedMedia).map(([category, items]) => {
        const categoryLabel =
          PHOTO_CATEGORIES.find((c) => c.value === category)?.label || category;
        return (
          <Card key={category}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {categoryLabel} ({items.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  >
                    {item.type === 'photo' ? (
                      <OptimizedImage
                        src={item.url}
                        alt={item.caption || 'Photo'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    {item.is_cover && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        ⭐ Обложка
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!item.is_cover && type === 'photo' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSetCover(item.id)}
                        >
                          ⭐
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setMediaToDelete(item);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        🗑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {media.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {type === 'photo'
                ? 'Загрузите фотографии школы'
                : 'Загрузите видео о школе'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать {type === 'photo' ? 'фото' : 'видео'}</DialogTitle>
            <DialogDescription>
              Измените категорию и описание
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {type === 'photo' && (
              <div className="space-y-2">
                <Label htmlFor="edit-category">Категория</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Описание</Label>
              <Input
                id="edit-caption"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Описание..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить {type === 'photo' ? 'фото' : 'видео'}?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

