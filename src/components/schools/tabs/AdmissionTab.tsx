'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SchoolProfile } from '@/types/school';

interface AdmissionTabProps {
  school: SchoolProfile;
}

/**
 * Таб "Поступление"
 * 
 * Включает:
 * - Статус набора (открыт/закрыт, дедлайн)
 * - Требования
 * - Документы
 * - Процесс поступления (пошаговый)
 * - Вступительные экзамены (если есть)
 * - Контактное лицо
 */
export function AdmissionTab({ school }: AdmissionTabProps) {
  const admission = school.admission;
  
  if (!admission) {
    return (
      <div className="text-center py-12 text-gray-500">
        Информация о поступлении пока не добавлена
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Status */}
      <section>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Статус набора</div>
                <div className="flex items-center gap-2">
                  <Badge variant={admission.isOpen ? 'default' : 'secondary'}>
                    {admission.isOpen ? 'Открыт набор' : 'Набор закрыт'}
                  </Badge>
                  {admission.deadline && (
                    <span className="text-sm text-gray-600">
                      Дедлайн: {new Date(admission.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Requirements */}
      {admission.requirements && admission.requirements.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Требования</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {admission.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Documents */}
      {admission.documents && admission.documents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Документы</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {admission.documents.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Process */}
      {admission.process && admission.process.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Процесс поступления</h2>
          <div className="space-y-4">
            {admission.process.map((step) => (
              <Card key={step.step}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-[12px] bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{step.title}</div>
                      <div className="text-gray-700">{step.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Entrance Exam */}
      {admission.hasEntranceExam && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Вступительные экзамены</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="text-gray-700 mb-2">Проводятся вступительные экзамены</div>
              {admission.examSubjects && admission.examSubjects.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Предметы:</div>
                  <div className="flex flex-wrap gap-2">
                    {admission.examSubjects.map((subject, idx) => (
                      <Badge key={idx} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Contact Person */}
      {admission.contactPerson && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Контактное лицо</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Имя: </span>
                  <span className="font-medium text-gray-900">
                    {admission.contactPerson.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Телефон: </span>
                  <a
                    href={`tel:${admission.contactPerson.phone}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {admission.contactPerson.phone}
                  </a>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email: </span>
                  <a
                    href={`mailto:${admission.contactPerson.email}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {admission.contactPerson.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

