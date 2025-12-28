'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressIndicator } from './ProgressIndicator';
import { cn } from '@/lib/utils';

export type SectionLevel = 'required' | 'important' | 'full' | 'media';

interface SectionCardProps {
  section: {
    id: string;
    name: string;
    description: string;
    href: string;
    completeness: number;
    level: SectionLevel;
  };
  schoolId: string;
}

const levelLabels = {
  required: 'ОБЯЗАТЕЛЬНЫЕ',
  important: 'ВАЖНЫЕ (влияют на рейтинг)',
  full: 'ПОЛНЫЕ (максимальный рейтинг)',
  media: 'МЕДИА',
};

export function SectionCard({ section, schoolId }: SectionCardProps) {
  const getStatusLabel = () => {
    if (section.completeness === 100) return '✅ 100%';
    if (section.completeness >= 60) return `⚠️ ${section.completeness}%`;
    if (section.completeness > 0) return `⚠️ ${section.completeness}%`;
    return '❌ 0%';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{section.name}</CardTitle>
            <CardDescription className="mt-1">{section.description}</CardDescription>
          </div>
          <div className="ml-4 text-right">
            <span className="text-sm font-medium">{getStatusLabel()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <ProgressIndicator value={section.completeness} showLabel={false} />
          <Button asChild variant="outline" className="w-full" size="sm">
            <Link href={section.href}>
              {section.completeness === 0
                ? 'Заполнить'
                : section.completeness === 100
                  ? 'Изменить'
                  : 'Заполнить'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SectionsGridProps {
  sections: SectionCardProps['section'][];
  schoolId: string;
  level: SectionLevel;
}

export function SectionsGrid({ sections, schoolId, level }: SectionsGridProps) {
  if (sections.length === 0) return null;

  const levelColors = {
    required: 'border-green-200 bg-green-50/50',
    important: 'border-yellow-200 bg-yellow-50/50',
    full: 'border-blue-200 bg-blue-50/50',
    media: 'border-purple-200 bg-purple-50/50',
  };

  return (
    <div className={cn('space-y-4 p-4 rounded-[24px] border', levelColors[level])}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {levelLabels[level]}
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} schoolId={schoolId} />
        ))}
      </div>
    </div>
  );
}

