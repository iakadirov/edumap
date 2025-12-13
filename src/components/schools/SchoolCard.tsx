import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { translateCity, translateDistrict } from '@/lib/utils/translations';
import type { Database } from '@/types/database';

type Organization = Database['public']['Tables']['organizations']['Row'] & {
  school_details?: Database['public']['Tables']['school_details']['Row'] | Database['public']['Tables']['school_details']['Row'][];
};

interface SchoolCardProps {
  school: Organization;
}

/**
 * Компонент карточки школы для списка
 * 
 * Features:
 * - Отображение названия, логотипа, рейтинга
 * - Тип школы (private/state/international)
 * - Цена (fee_monthly_min - fee_monthly_max)
 * - Адрес (район, город)
 * - Ссылка на профиль школы
 * - Hover эффекты
 */
export function SchoolCard({ school }: SchoolCardProps) {
  // Обрабатываем school_details (может быть массивом или объектом)
  const details = Array.isArray(school.school_details)
    ? school.school_details[0]
    : school.school_details;

  // Форматирование типа школы
  const schoolTypeLabels: Record<string, string> = {
    private: 'Xususiy',
    state: 'Davlat',
    international: 'Xalqaro',
  };

  const schoolTypeLabel = details?.school_type
    ? schoolTypeLabels[details.school_type] || details.school_type
    : null;

  // Форматирование цены
  const formatPrice = (min: number | null, max: number | null) => {
    if (!min || !max) return null;
    return `${min.toLocaleString('ru-RU')} - ${max.toLocaleString('ru-RU')} soʻm/oy`;
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="mb-1 text-xl leading-tight">
              {school.name}
            </CardTitle>
            {(school.district || school.city) && (
              <p className="text-sm text-muted-foreground">
                {[
                  school.district ? translateDistrict(school.district) : null,
                  school.city ? translateCity(school.city) : null
                ].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          {school.overall_rating && (
            <div className="flex shrink-0 flex-col items-end">
              <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {school.overall_rating.toFixed(1)}
              </div>
              <span className="mt-1 text-xs text-muted-foreground">Reyting</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Описание */}
        {school.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {school.description}
          </p>
        )}

        {/* Детали школы */}
        {details && (
          <div className="space-y-2 text-sm">
            {schoolTypeLabel && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Tur:</span>
                <span className="text-muted-foreground">{schoolTypeLabel}</span>
              </div>
            )}

            {details.fee_monthly_min && details.fee_monthly_max && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Narx:</span>
                <span className="text-muted-foreground">
                  {formatPrice(details.fee_monthly_min, details.fee_monthly_max)}
                </span>
              </div>
            )}

            {details.grade_from && details.grade_to && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Sinflar:</span>
                <span className="text-muted-foreground">
                  {details.grade_from}–{details.grade_to}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Кнопка "Подробнее" */}
        <Button asChild className="mt-auto w-full" variant="outline">
          <Link 
            href={`/schools/${school.slug || school.id}`}
            prefetch={true}
          >
            Batafsil →
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

