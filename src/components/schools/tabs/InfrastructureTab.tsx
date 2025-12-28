'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SchoolProfile } from '@/types/school';

interface InfrastructureTabProps {
  school: SchoolProfile;
}

/**
 * Таб "Инфраструктура"
 * 
 * Включает:
 * - Общая информация (площадь, этажи, год постройки, последний ремонт)
 * - Классы (количество, с кондиционером, с интерактивными досками)
 * - Объекты (список facilities)
 * - Спорт (список sports)
 * - Безопасность (список security)
 * - IT (WiFi, компьютеры, онлайн-портал)
 */
export function InfrastructureTab({ school }: InfrastructureTabProps) {
  const infrastructure = school.infrastructure;
  
  if (!infrastructure) {
    return (
      <div className="text-center py-12 text-gray-500">
        Информация об инфраструктуре пока не добавлена
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Building Info */}
      {infrastructure.building && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Общая информация</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {infrastructure.building.area && (
                  <div>
                    <span className="text-sm text-gray-500">Площадь: </span>
                    <span className="font-medium text-gray-900">
                      {infrastructure.building.area.toLocaleString('ru-RU')} м²
                    </span>
                  </div>
                )}
                {infrastructure.building.floors && (
                  <div>
                    <span className="text-sm text-gray-500">Этажей: </span>
                    <span className="font-medium text-gray-900">
                      {infrastructure.building.floors}
                    </span>
                  </div>
                )}
                {infrastructure.building.yearBuilt && (
                  <div>
                    <span className="text-sm text-gray-500">Год постройки: </span>
                    <span className="font-medium text-gray-900">
                      {infrastructure.building.yearBuilt}
                    </span>
                  </div>
                )}
                {infrastructure.building.lastRenovation && (
                  <div>
                    <span className="text-sm text-gray-500">Последний ремонт: </span>
                    <span className="font-medium text-gray-900">
                      {infrastructure.building.lastRenovation}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Classrooms */}
      {infrastructure.classrooms && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Классы</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                {infrastructure.classrooms.total && (
                  <div>
                    <span className="text-sm text-gray-500">Всего классов: </span>
                    <span className="font-medium text-gray-900">
                      {infrastructure.classrooms.total}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">С кондиционером: </span>
                  <span className="font-medium text-gray-900">
                    {infrastructure.classrooms.withAC ? 'Да' : 'Нет'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">С интерактивными досками: </span>
                  <span className="font-medium text-gray-900">
                    {infrastructure.classrooms.withSmartBoard ? 'Да' : 'Нет'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Facilities */}
      {infrastructure.facilities && infrastructure.facilities.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Объекты</h2>
          <div className="grid md:grid-cols-3 gap-2">
            {infrastructure.facilities.map((facility, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 border rounded-[12px] bg-gray-50"
              >
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">{facility}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Sports */}
      {infrastructure.sports && infrastructure.sports.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Спорт</h2>
          <div className="grid md:grid-cols-3 gap-2">
            {infrastructure.sports.map((sport, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 border rounded-[12px] bg-gray-50"
              >
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">{sport}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Security */}
      {infrastructure.security && infrastructure.security.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Безопасность</h2>
          <div className="grid md:grid-cols-3 gap-2">
            {infrastructure.security.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 border rounded-[12px] bg-gray-50"
              >
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* IT */}
      {infrastructure.it && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">IT инфраструктура</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">WiFi: </span>
                  <span className="font-medium text-gray-900">
                    {infrastructure.it.hasWifi ? 'Да' : 'Нет'}
                  </span>
                </div>
                {infrastructure.it.computersCount && (
                  <div>
                    <span className="text-sm text-gray-500">Компьютеров: </span>
                    <span className="font-medium text-gray-900">
                      {infrastructure.it.computersCount}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Онлайн-портал: </span>
                  <span className="font-medium text-gray-900">
                    {infrastructure.it.hasOnlinePortal ? 'Да' : 'Нет'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

