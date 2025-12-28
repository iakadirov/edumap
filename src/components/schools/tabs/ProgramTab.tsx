'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SchoolProfile } from '@/types/school';

interface ProgramTabProps {
  school: SchoolProfile;
}

/**
 * Таб "Программа"
 * 
 * Включает:
 * - Описание программы
 * - Этапы обучения
 * - Предметы
 * - Внеурочная деятельность
 * - Подготовка к экзаменам
 * - Языки обучения
 */
export function ProgramTab({ school }: ProgramTabProps) {
  return (
    <div className="space-y-8">
      {/* Program Description */}
      {school.program?.description && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Описание программы</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {school.program.description}
          </p>
        </section>
      )}
      
      {/* Curriculum */}
      {school.curriculum && school.curriculum.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Учебная программа</h2>
          <div className="flex flex-wrap gap-2">
            {school.curriculum.map((curr, idx) => (
              <Badge key={idx} variant="secondary">
                {curr}
              </Badge>
            ))}
          </div>
        </section>
      )}
      
      {/* Stages */}
      {school.program?.stages && school.program.stages.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Этапы обучения</h2>
          <div className="space-y-4">
            {school.program.stages.map((stage, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{stage.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-2">Классы: {stage.grades}</div>
                  <p className="text-gray-700">{stage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Subjects */}
      {school.program?.subjects && school.program.subjects.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Предметы</h2>
          <div className="flex flex-wrap gap-2">
            {school.program.subjects.map((subject, idx) => (
              <Badge key={idx} variant="outline">
                {subject}
              </Badge>
            ))}
          </div>
        </section>
      )}
      
      {/* Extra Curricular */}
      {school.program?.extraCurricular && school.program.extraCurricular.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Внеурочная деятельность</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {school.program.extraCurricular.map((activity, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="text-sm text-gray-500 mb-1">{activity.category}</div>
                  <div className="font-medium text-gray-900">{activity.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Exam Prep */}
      {school.program?.examPrep && school.program.examPrep.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Подготовка к экзаменам</h2>
          <div className="flex flex-wrap gap-2">
            {school.program.examPrep.map((exam, idx) => (
              <Badge key={idx} variant="default">
                {exam}
              </Badge>
            ))}
          </div>
        </section>
      )}
      
      {/* Languages */}
      {school.program?.languages && school.program.languages.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Языки обучения</h2>
          <div className="space-y-2">
            {school.program.languages.map((lang, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-[12px]">
                <span className="font-medium text-gray-900">{lang.name}</span>
                <span className="text-sm text-gray-500">{lang.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

