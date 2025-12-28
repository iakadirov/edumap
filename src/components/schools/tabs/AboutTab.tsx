'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  SquareAcademicCapBold,
  UserHandsBold,
  UserCheckBold,
  BookBold,
  DownloadBold,
  FileTextBold,
  PlayBold,
  AltArrowRightBold,
  AltArrowDownLinear,
} from '@solar-icons/react-perf';
import type { SchoolProfile } from '@/types/school';

interface AboutTabProps {
  school: SchoolProfile;
}

/**
 * Таб "О школе"
 * 
 * Включает:
 * - Описание школы (с кнопкой "Читать полностью")
 * - Ключевые факты (4 карточки)
 * - Фотогалерея
 * - Видео о школе
 * - Документы и лицензии
 */
export function AboutTab({ school }: AboutTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const stats = [
    {
      icon: SquareAcademicCapBold,
      value: school.stats.foundedYear || '—',
      label: 'Год основания',
      color: 'blue',
    },
    {
      icon: UserHandsBold,
      value: school.stats.studentsCount?.toLocaleString('ru-RU') || '—',
      label: 'Учеников',
      color: 'green',
    },
    {
      icon: UserCheckBold,
      value: school.stats.teachersCount || '—',
      label: 'Учителей',
      color: 'purple',
    },
    {
      icon: BookBold,
      value: school.stats.studentTeacherRatio || '—',
      label: 'Учеников на учителя',
      color: 'amber',
    },
  ];
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  
  const descriptionLength = school.description?.length || 0;
  const shouldShowExpand = descriptionLength > 300;
  const displayDescription = isExpanded
    ? school.description
    : school.description?.substring(0, 300);
  
  return (
    <div className="space-y-8">
      {/* Description */}
      {school.description && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">О школе</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {isExpanded ? school.description : displayDescription}
              {!isExpanded && descriptionLength > 300 && '...'}
            </p>
          </div>
          {shouldShowExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
            >
              {isExpanded ? 'Свернуть' : 'Читать полностью'}
              <AltArrowDownLinear
                className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </section>
      )}
      
      {/* Key Facts */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ключевые факты</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6 pb-4">
                <div
                  className={`w-12 h-12 rounded-[24px] ${colorClasses[stat.color]} flex items-center justify-center mx-auto mb-3`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Photo Gallery */}
      {school.photos && school.photos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Фотогалерея</h2>
            <Button variant="ghost" className="text-blue-600">
              Все фото
              <AltArrowRightBold className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {school.photos.slice(0, 4).map((photo, idx) => (
              <div
                key={photo.id || idx}
                className="aspect-square rounded-[24px] overflow-hidden cursor-pointer hover:opacity-90 transition"
              >
                <OptimizedImage
                  src={photo.url}
                  alt={photo.caption || `Фото ${idx + 1}`}
                  width={150}
                  height={150}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 20vw, 150px"
                />
              </div>
            ))}
            {school.photos.length > 4 && (
              <div className="aspect-square rounded-[24px] bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
                <span className="text-lg font-semibold text-gray-600">
                  +{school.photos.length - 4}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Video */}
      {school.videos && school.videos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Видео о школе</h2>
          <div className="aspect-video rounded-[24px] overflow-hidden bg-gray-100 relative group cursor-pointer">
            <OptimizedImage
              src={school.videos[0].url}
              alt={school.videos[0].caption || 'Видео о школе'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
              <div className="w-16 h-16 rounded-[24px] bg-white/90 flex items-center justify-center">
                <PlayBold className="w-8 h-8 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Documents */}
      {school.documents && school.documents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Документы и лицензии</h2>
          <div className="space-y-3">
            {school.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-[24px] hover:border-gray-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[24px] bg-red-50 flex items-center justify-center">
                    <FileTextBold className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-500">
                      {doc.issuer}, {doc.year}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url} download>
                    <DownloadBold className="w-4 h-4 mr-2" />
                    PDF
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

