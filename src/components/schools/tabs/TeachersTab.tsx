'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { SchoolProfile } from '@/types/school';

interface TeachersTabProps {
  school: SchoolProfile;
}

/**
 * Таб "Учителя"
 * 
 * Включает:
 * - Статистика (общее количество, с высшим образованием, с международными сертификатами, носители языка, иностранные учителя, средний опыт)
 * - Руководство (директор, заместители с фото и биографией)
 * - Ключевые учителя (если есть)
 */
export function TeachersTab({ school }: TeachersTabProps) {
  const teachers = school.teachers;
  
  if (!teachers) {
    return (
      <div className="text-center py-12 text-gray-500">
        Информация о педагогическом составе пока не добавлена
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Statistics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Статистика</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {teachers.totalCount !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{teachers.totalCount}</div>
                <div className="text-sm text-gray-500 mt-1">Всего учителей</div>
              </CardContent>
            </Card>
          )}
          {teachers.withHigherEducation !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">
                  {teachers.withHigherEducation}
                </div>
                <div className="text-sm text-gray-500 mt-1">С высшим образованием</div>
              </CardContent>
            </Card>
          )}
          {teachers.withInternationalCerts !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">
                  {teachers.withInternationalCerts}
                </div>
                <div className="text-sm text-gray-500 mt-1">С международными сертификатами</div>
              </CardContent>
            </Card>
          )}
          {teachers.nativeSpeakers !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{teachers.nativeSpeakers}</div>
                <div className="text-sm text-gray-500 mt-1">Носители языка</div>
              </CardContent>
            </Card>
          )}
          {teachers.foreignTeachers !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{teachers.foreignTeachers}</div>
                <div className="text-sm text-gray-500 mt-1">Иностранные учителя</div>
              </CardContent>
            </Card>
          )}
          {teachers.averageExperience !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">
                  {teachers.averageExperience} лет
                </div>
                <div className="text-sm text-gray-500 mt-1">Средний опыт работы</div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      
      {/* Leadership */}
      {teachers.leadership && teachers.leadership.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Руководство</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {teachers.leadership.map((leader) => (
              <Card key={leader.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {leader.photoUrl && (
                      <div className="w-20 h-20 rounded-[12px] overflow-hidden flex-shrink-0">
                        <OptimizedImage
                          src={leader.photoUrl}
                          alt={leader.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{leader.name}</div>
                      <div className="text-sm text-gray-500 mb-2">{leader.position}</div>
                      {leader.education && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Образование: </span>
                          {leader.education}
                        </div>
                      )}
                      {leader.experienceYears && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Опыт: </span>
                          {leader.experienceYears} лет
                        </div>
                      )}
                      {leader.bio && (
                        <p className="text-sm text-gray-700 mt-2">{leader.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

