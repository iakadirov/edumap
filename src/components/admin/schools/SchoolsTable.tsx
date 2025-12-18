'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { formatDate } from '@/lib/utils/date';
import { useToast } from '@/contexts/ToastContext';
import { ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Вспомогательные функции для статусов
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    pending: 'На модерации',
    published: 'Опубликована',
    rejected: 'Отклонена',
    suspended: 'Приостановлена',
  };
  return labels[status] || status;
};

const getStatusVariant = (status: string) => {
  if (status === 'published') return 'default';
  if (status === 'pending') return 'secondary';
  if (status === 'draft') return 'outline';
  if (status === 'rejected' || status === 'suspended') return 'destructive';
  return 'outline';
};

interface School {
  id: string;
  slug: string | null;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  status: string | null;
  created_at: string;
}

interface SchoolsTableProps {
  schools: School[];
  currentPage: number;
  totalPages: number;
  search: string;
  status: string;
  progressMap?: Map<string, number>;
}

// Компонент для выбора статуса школы
function StatusSelect({
  schoolId,
  currentStatus,
  onStatusChange,
}: {
  schoolId: string;
  currentStatus: string;
  onStatusChange: () => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  // Синхронизируем статус с пропсами
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    // Оптимистичное обновление - сразу меняем статус в UI
    const previousStatus = status;
    setStatus(newStatus);
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Откатываем изменения при ошибке
        setStatus(previousStatus);
        const error = await response.json();
        let errorMessage = error.details || error.error || 'Ошибка изменения статуса';
        
        // Если ошибка связана с constraint, показываем более понятное сообщение
        if (errorMessage.includes('check constraint') || errorMessage.includes('organizations_status_check')) {
          errorMessage = 'Ошибка: статус не поддерживается. Убедитесь, что миграция базы данных применена.';
        }
        
        console.error('Status update error:', error);
        throw new Error(errorMessage);
      }

      // Успешно обновлено - вызываем callback для обновления родительского компонента
      showToast({
        type: 'success',
        title: 'Статус изменен',
        description: `Статус школы изменен на "${getStatusLabel(newStatus)}"`,
        duration: 3000,
      });
      onStatusChange();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        description: err.message || 'Не удалось изменить статус',
        duration: 5000,
      });
      // Возвращаем предыдущий статус при ошибке
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={loading}
    >
      <SelectTrigger className="w-[140px] h-8">
        <SelectValue placeholder="Изменить..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Черновик</SelectItem>
        <SelectItem value="pending">На модерации</SelectItem>
        <SelectItem value="published">Опубликована</SelectItem>
        <SelectItem value="rejected">Отклонена</SelectItem>
        <SelectItem value="suspended">Приостановлена</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function SchoolsTable({
  schools,
  currentPage,
  totalPages,
  search: initialSearch,
  status: initialStatus,
  progressMap = new Map(),
}: SchoolsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/schools?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/admin/schools?${params.toString()}`);
  };

  const handleDelete = async (school: School) => {
    setSchoolToDelete(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!schoolToDelete) return;

    try {
      const response = await fetch(`/api/admin/schools/${schoolToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSchoolToDelete(null);
        // Обновляем данные страницы без полной перезагрузки
        router.refresh();
      } else {
        alert('Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Xatolik yuz berdi');
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/schools?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="draft">Черновик</SelectItem>
            <SelectItem value="pending">На модерации</SelectItem>
            <SelectItem value="published">Опубликована</SelectItem>
            <SelectItem value="rejected">Отклонена</SelectItem>
            <SelectItem value="suspended">Приостановлена</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>To'ldirilgan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Maktablar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => {
                const progress = progressMap.get(school.id) || 0;
                return (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">
                      {school.name_uz || school.name_ru || school.name || 'Nomsiz'}
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-muted-foreground min-w-[40px] text-right">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(school.status || 'draft') as any} className="text-xs">
                        {getStatusLabel(school.status || 'draft')}
                      </Badge>
                      <StatusSelect
                        schoolId={school.id}
                        currentStatus={school.status || 'draft'}
                        onStatusChange={() => {
                          // Обновляем данные после изменения статуса
                          router.refresh();
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(school.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {school.slug && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/schools/${school.slug}`} target="_blank" rel="noopener noreferrer" title="Saytda ko'rish">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/schools/${school.id}`} prefetch={false}>Tahrirlash</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(school)}
                        className="text-destructive hover:text-destructive"
                      >
                        O'chirish
                      </Button>
                    </div>
                  </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sahifa {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Oldingi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maktabni o'chirish</DialogTitle>
            <DialogDescription>
              {schoolToDelete?.name_uz || schoolToDelete?.name_ru || 'Bu maktab'}ni o'chirishni
              tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

