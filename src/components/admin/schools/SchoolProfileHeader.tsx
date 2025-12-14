'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressIndicator } from './ProgressIndicator';

interface SchoolProfileHeaderProps {
  school: {
    id: string;
    slug?: string | null;
    name: string;
    name_uz?: string | null;
    name_ru?: string | null;
    status: string;
    overall_rating?: number | null;
  };
  overallProgress: number;
  basePath?: string; // '/admin' or '/school'
}

export function SchoolProfileHeader({
  school,
  overallProgress,
  basePath = '/admin',
}: SchoolProfileHeaderProps) {
  const schoolName = school.name_uz || school.name_ru || school.name;

  const getStatusBadge = () => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      published: { label: 'Опубликована', variant: 'default' },
      pending: { label: 'На модерации', variant: 'secondary' },
      draft: { label: 'Черновик', variant: 'outline' },
      rejected: { label: 'Отклонена', variant: 'destructive' },
      suspended: { label: 'Приостановлена', variant: 'destructive' },
    };

    const config = statusConfig[school.status] || { label: school.status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="border-b bg-white rounded-t-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`${basePath}/schools`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Назад к списку
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{schoolName}</h1>
          <div className="flex items-center gap-4 mt-3">
            {getStatusBadge()}
            <span className="text-sm text-muted-foreground">
              Заполнено: {overallProgress}%
            </span>
            {school.overall_rating && (
              <span className="text-sm font-medium">⭐ {school.overall_rating}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/schools/${school.slug || school.id}`} target="_blank">
              👁 Просмотр на сайте
            </Link>
          </Button>
        </div>
      </div>
      <ProgressIndicator value={overallProgress} />
    </div>
  );
}

