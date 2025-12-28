'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useAutosave, formatAutosaveStatus } from '@/lib/schools/autosave';
import { validateTeachersSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';

interface StaffMember {
  id?: string;
  name: string;
  position: string;
  photo_url?: string;
  experience_years?: number;
  education?: string;
  certifications?: string[];
}

interface OrganizationBasic {
  id: string;
  name: string;
  slug: string;
}

interface SchoolDetailsBasic {
  total_teachers?: number;
  avg_experience_years?: number;
  students_per_teacher?: number;
}

interface TeachersFormProps {
  organization: OrganizationBasic;
  schoolDetails?: SchoolDetailsBasic;
  initialStaff?: StaffMember[];
}

export function TeachersForm({
  organization,
  schoolDetails,
  initialStaff = [],
}: TeachersFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Общая статистика
  const [totalTeachers, setTotalTeachers] = useState<number>(
    schoolDetails?.total_teachers || 0
  );
  const [avgExperienceYears, setAvgExperienceYears] = useState<number>(
    schoolDetails?.avg_experience_years || 0
  );
  const [studentsPerTeacher, setStudentsPerTeacher] = useState<number>(
    schoolDetails?.students_per_teacher || 0
  );

  // Квалификация (%)
  const [percentWithHigherEducation, setPercentWithHigherEducation] = useState<number>(0);
  const [percentWithPedagogicalEducation, setPercentWithPedagogicalEducation] = useState<number>(0);
  const [percentWithMasters, setPercentWithMasters] = useState<number>(0);
  const [percentWithPhd, setPercentWithPhd] = useState<number>(0);

  // Сертификации (количество)
  const [cambridgeTkt, setCambridgeTkt] = useState<number>(0);
  const [celtaDelta, setCeltaDelta] = useState<number>(0);
  const [ibCertification, setIbCertification] = useState<number>(0);
  const [highestCategory, setHighestCategory] = useState<number>(0);

  // Иностранные специалисты
  const [nativeSpeakers, setNativeSpeakers] = useState<number>(0);
  const [foreignTeachers, setForeignTeachers] = useState<number>(0);

  // Руководство
  const [staff, setStaff] = useState<Array<{
    id?: string;
    name: string;
    position: string;
    photo_url?: string;
    experience_years?: number;
    education?: string;
    certifications?: string[];
  }>>(initialStaff);

  // Стабильность коллектива
  const [turnoverRate, setTurnoverRate] = useState<number>(0);
  const [hasProfessionalDevelopment, setHasProfessionalDevelopment] = useState(false);

  const formData = {
    total_teachers: totalTeachers,
    avg_experience_years: avgExperienceYears,
    students_per_teacher: studentsPerTeacher,
    percent_with_higher_education: percentWithHigherEducation,
    percent_with_pedagogical_education: percentWithPedagogicalEducation,
    percent_with_masters: percentWithMasters,
    percent_with_phd: percentWithPhd,
  };

  const { status: autosaveStatus, save } = useAutosave({
    data: formData,
    onSave: async (data) => {
      const progress = calculateSectionProgress('teachers', data);
      const validation = validateTeachersSection(data);

      if (!validation.valid) {
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
        throw new Error('Validation failed');
      }

      setValidationErrors({});

      // Сохраняем статистику в school_details (если есть такие поля)
      // В реальности нужно добавить эти поля в таблицу school_details или создать отдельную таблицу

      await fetch(`/api/admin/schools/${organization.id}/sections/teachers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completeness: progress }),
      });
    },
    interval: 30000,
    debounceMs: 2000,
  });

  const handleManualSave = async () => {
    await save();
  };

  const addStaffMember = () => {
    setStaff([...staff, { name: '', position: 'director' }]);
  };

  const removeStaffMember = (index: number) => {
    setStaff(staff.filter((_, i) => i !== index));
  };

  const updateStaffMember = (index: number, updates: Partial<typeof staff[0]>) => {
    const updated = [...staff];
    updated[index] = { ...updated[index], ...updates };
    setStaff(updated);
  };

  return (
    <form className="space-y-8">
      <div className="flex items-center justify-between p-3 bg-muted rounded-[24px]">
        <span className="text-sm text-muted-foreground">
          {formatAutosaveStatus(autosaveStatus)}
        </span>
        <Button type="button" onClick={handleManualSave} size="sm" variant="outline">
          Сохранить
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-[24px] bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Общая статистика */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ОБЩАЯ СТАТИСТИКА</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="totalTeachers">Всего учителей *</Label>
            <Input
              id="totalTeachers"
              type="number"
              value={totalTeachers || ''}
              onChange={(e) => setTotalTeachers(parseInt(e.target.value) || 0)}
              placeholder="65"
            />
            {validationErrors.total_teachers && (
              <p className="text-sm text-destructive">{validationErrors.total_teachers}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgExperience">Ср. стаж (лет)</Label>
            <Input
              id="avgExperience"
              type="number"
              value={avgExperienceYears || ''}
              onChange={(e) => setAvgExperienceYears(parseInt(e.target.value) || 0)}
              placeholder="12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentsPerTeacher">Учеников на 1 учителя</Label>
            <Input
              id="studentsPerTeacher"
              type="number"
              value={studentsPerTeacher || ''}
              onChange={(e) => setStudentsPerTeacher(parseInt(e.target.value) || 0)}
              placeholder="13"
            />
          </div>
        </div>
      </div>

      {/* Квалификация */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          КВАЛИФИКАЦИЯ (% от общего числа учителей)
        </h2>
        <div className="space-y-4">
          {[
            {
              label: 'С высшим образованием',
              value: percentWithHigherEducation,
              setter: setPercentWithHigherEducation,
              field: 'percent_with_higher_education',
            },
            {
              label: 'С педагогическим образованием',
              value: percentWithPedagogicalEducation,
              setter: setPercentWithPedagogicalEducation,
              field: 'percent_with_pedagogical_education',
            },
            {
              label: 'С магистерской степенью',
              value: percentWithMasters,
              setter: setPercentWithMasters,
              field: 'percent_with_masters',
            },
            {
              label: 'С PhD / кандидаты наук',
              value: percentWithPhd,
              setter: setPercentWithPhd,
              field: 'percent_with_phd',
            },
          ].map((item) => (
            <div key={item.field} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{item.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.value || ''}
                    onChange={(e) => item.setter(parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              {validationErrors[item.field] && (
                <p className="text-sm text-destructive">{validationErrors[item.field]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Сертификации */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">СЕРТИФИКАЦИИ (количество учителей)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cambridgeTkt">Cambridge TKT</Label>
            <Input
              id="cambridgeTkt"
              type="number"
              value={cambridgeTkt || ''}
              onChange={(e) => setCambridgeTkt(parseInt(e.target.value) || 0)}
              placeholder="15"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="celtaDelta">CELTA/DELTA</Label>
            <Input
              id="celtaDelta"
              type="number"
              value={celtaDelta || ''}
              onChange={(e) => setCeltaDelta(parseInt(e.target.value) || 0)}
              placeholder="8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ibCert">IB сертификация</Label>
            <Input
              id="ibCert"
              type="number"
              value={ibCertification || ''}
              onChange={(e) => setIbCertification(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="highestCategory">Высшая категория</Label>
            <Input
              id="highestCategory"
              type="number"
              value={highestCategory || ''}
              onChange={(e) => setHighestCategory(parseInt(e.target.value) || 0)}
              placeholder="12"
            />
          </div>
        </div>
      </div>

      {/* Иностранные специалисты */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ИНОСТРАННЫЕ СПЕЦИАЛИСТЫ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nativeSpeakers">Native speakers (англ.)</Label>
            <Input
              id="nativeSpeakers"
              type="number"
              value={nativeSpeakers || ''}
              onChange={(e) => setNativeSpeakers(parseInt(e.target.value) || 0)}
              placeholder="8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="foreignTeachers">Учителя из-за рубежа</Label>
            <Input
              id="foreignTeachers"
              type="number"
              value={foreignTeachers || ''}
              onChange={(e) => setForeignTeachers(parseInt(e.target.value) || 0)}
              placeholder="12"
            />
          </div>
        </div>
      </div>

      {/* Руководство школы */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">РУКОВОДСТВО ШКОЛЫ (публичная информация)</h2>
        <div className="space-y-4">
          {staff.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-[24px] flex items-center justify-center">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-[24px]"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Имя *</Label>
                        <Input
                          value={member.name}
                          onChange={(e) =>
                            updateStaffMember(index, { name: e.target.value })
                          }
                          placeholder="Иванова Мария Петровна"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Должность *</Label>
                        <Select
                          value={member.position}
                          onValueChange={(value) =>
                            updateStaffMember(index, { position: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="director">Директор</SelectItem>
                            <SelectItem value="deputy_director">Завуч</SelectItem>
                            <SelectItem value="head_teacher">Завуч по учебной работе</SelectItem>
                            <SelectItem value="teacher">Учитель</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Опыт (лет)</Label>
                        <Input
                          type="number"
                          value={member.experience_years || ''}
                          onChange={(e) =>
                            updateStaffMember(index, {
                              experience_years: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="25"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Образование</Label>
                        <Input
                          value={member.education || ''}
                          onChange={(e) =>
                            updateStaffMember(index, { education: e.target.value })
                          }
                          placeholder="ТГПУ, магистр"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaffMember(index)}
                  >
                    🗑
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addStaffMember}>
            + Добавить руководителя
          </Button>
        </div>
      </div>

      {/* Стабильность коллектива */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">СТАБИЛЬНОСТЬ КОЛЛЕКТИВА</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="turnoverRate">Текучка кадров за последний год (%)</Label>
            <Input
              id="turnoverRate"
              type="number"
              min="0"
              max="100"
              value={turnoverRate || ''}
              onChange={(e) => setTurnoverRate(parseInt(e.target.value) || 0)}
              placeholder="12"
            />
            <p className="text-sm text-muted-foreground">ℹ️ Норма рынка: 10-15%</p>
          </div>
          <div className="space-y-2">
            <Label>Регулярное повышение квалификации</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="pd"
                  id="pd-yes"
                  checked={hasProfessionalDevelopment}
                  onChange={() => setHasProfessionalDevelopment(true)}
                  className="w-4 h-4"
                />
                <Label htmlFor="pd-yes" className="cursor-pointer">
                  Да, есть программа PD
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="pd"
                  id="pd-no"
                  checked={!hasProfessionalDevelopment}
                  onChange={() => setHasProfessionalDevelopment(false)}
                  className="w-4 h-4"
                />
                <Label htmlFor="pd-no" className="cursor-pointer">
                  Нет
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отменить изменения
        </Button>
        <Button type="button" onClick={handleManualSave}>
          Сохранить
        </Button>
      </div>
    </form>
  );
}

