'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProgressIndicator } from '../ProgressIndicator';
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
  bio?: string;
}

interface TeachersFormProps {
  schoolId: string;
  currentProgress: number;
  initialStaff?: StaffMember[];
}

export function TeachersForm({
  schoolId,
  currentProgress,
  initialStaff = [],
}: TeachersFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Общая статистика
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [avgExperienceYears, setAvgExperienceYears] = useState<number>(0);
  const [studentsPerTeacher, setStudentsPerTeacher] = useState<number>(0);

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
  const [teachersFromAbroad, setTeachersFromAbroad] = useState<number>(0);

  // Стабильность коллектива
  const [turnoverRate, setTurnoverRate] = useState<number>(0);
  const [hasPdProgram, setHasPdProgram] = useState<boolean>(false);

  // Руководство
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState<StaffMember>({
    name: '',
    position: 'director',
    experience_years: 0,
    education: '',
    certifications: [],
    bio: '',
  });

  const formData = {
    total_teachers: totalTeachers,
    avg_experience_years: avgExperienceYears,
    students_per_teacher: studentsPerTeacher,
    percent_with_higher_education: percentWithHigherEducation,
    percent_with_pedagogical_education: percentWithPedagogicalEducation,
    percent_with_masters: percentWithMasters,
    percent_with_phd: percentWithPhd,
    cambridge_tkt: cambridgeTkt,
    celta_delta: celtaDelta,
    ib_certification: ibCertification,
    highest_category: highestCategory,
    native_speakers: nativeSpeakers,
    teachers_from_abroad: teachersFromAbroad,
    turnover_rate: turnoverRate,
    has_pd_program: hasPdProgram,
    staff: staff,
  };

  const saveData = async (data: any) => {
    // Сохраняем общую статистику (можно хранить в JSONB поле school_details или отдельной таблице)
    const response = await fetch(`/api/admin/schools/${schoolId}/sections/teachers`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save');
    }

    // Обновляем прогресс
    const progress = calculateSectionProgress('teachers', data);
    await fetch(`/api/admin/schools/${schoolId}/sections/teachers`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completeness: progress }),
    });
  };

  const autosave = useAutosave({
    data: formData,
    onSave: saveData,
    interval: 30000,
    debounceMs: 2000,
    enabled: true,
  });

  const handleManualSave = async () => {
    setLoading(true);
    setError(null);

    const validation = validateTeachersSection(formData);
    if (!validation.valid) {
      setError(validation.errors.map((e) => e.message).join(', '));
      setLoading(false);
      return;
    }

    try {
      await saveData(formData);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setNewStaff({
      name: '',
      position: 'director',
      experience_years: 0,
      education: '',
      certifications: [],
      bio: '',
    });
    setEditDialogOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setNewStaff(member);
    setEditDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!newStaff.name || !newStaff.position) {
      setError('Имя и должность обязательны');
      return;
    }

    try {
      if (editingStaff && editingStaff.id) {
        // Обновляем существующего
        const response = await fetch(`/api/admin/schools/${schoolId}/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newStaff),
        });

        if (response.ok) {
          const updated = await response.json();
          setStaff(staff.map((s) => (s.id === editingStaff.id ? updated : s)));
        }
      } else {
        // Создаем нового
        const response = await fetch(`/api/admin/schools/${schoolId}/staff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newStaff),
        });

        if (response.ok) {
          const created = await response.json();
          setStaff([...staff, created]);
        }
      }

      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save staff member');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/staff/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStaff(staff.filter((s) => s.id !== id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Педагогический состав</CardTitle>
              <CardDescription>Заполнено: {currentProgress}%</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">
                {formatAutosaveStatus(autosave.status)}
              </div>
              <ProgressIndicator value={currentProgress} showLabel={false} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Форма */}
      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Общая статистика */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Общая статистика</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="totalTeachers">Всего учителей *</Label>
                <Input
                  id="totalTeachers"
                  type="number"
                  value={totalTeachers}
                  onChange={(e) => setTotalTeachers(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgExperience">Средний стаж (лет)</Label>
                <Input
                  id="avgExperience"
                  type="number"
                  value={avgExperienceYears}
                  onChange={(e) => setAvgExperienceYears(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentsPerTeacher">Учеников на 1 учителя</Label>
                <Input
                  id="studentsPerTeacher"
                  type="number"
                  value={studentsPerTeacher}
                  onChange={(e) => setStudentsPerTeacher(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Квалификация */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Квалификация (% от общего числа учителей)</h2>
            <div className="space-y-4">
              {[
                {
                  label: 'С высшим образованием',
                  value: percentWithHigherEducation,
                  setter: setPercentWithHigherEducation,
                },
                {
                  label: 'С педагогическим образованием',
                  value: percentWithPedagogicalEducation,
                  setter: setPercentWithPedagogicalEducation,
                },
                {
                  label: 'С магистерской степенью',
                  value: percentWithMasters,
                  setter: setPercentWithMasters,
                },
                {
                  label: 'С PhD / кандидаты наук',
                  value: percentWithPhd,
                  setter: setPercentWithPhd,
                },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => item.setter(parseInt(e.target.value) || 0)}
                      className="w-20"
                      min={0}
                      max={100}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Сертификации */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Сертификации (количество учителей)</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cambridgeTkt">Cambridge TKT</Label>
                <Input
                  id="cambridgeTkt"
                  type="number"
                  value={cambridgeTkt}
                  onChange={(e) => setCambridgeTkt(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celtaDelta">CELTA/DELTA</Label>
                <Input
                  id="celtaDelta"
                  type="number"
                  value={celtaDelta}
                  onChange={(e) => setCeltaDelta(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ibCert">IB сертификация</Label>
                <Input
                  id="ibCert"
                  type="number"
                  value={ibCertification}
                  onChange={(e) => setIbCertification(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestCat">Высшая категория</Label>
                <Input
                  id="highestCat"
                  type="number"
                  value={highestCategory}
                  onChange={(e) => setHighestCategory(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Иностранные специалисты */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Иностранные специалисты</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nativeSpeakers">Native speakers (англ.)</Label>
                <Input
                  id="nativeSpeakers"
                  type="number"
                  value={nativeSpeakers}
                  onChange={(e) => setNativeSpeakers(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teachersAbroad">Учителя из-за рубежа</Label>
                <Input
                  id="teachersAbroad"
                  type="number"
                  value={teachersFromAbroad}
                  onChange={(e) => setTeachersFromAbroad(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Руководство школы */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Руководство школы (публичная информация)</h2>
              <Button variant="outline" size="sm" onClick={handleAddStaff}>
                + Добавить руководителя
              </Button>
            </div>
            <div className="space-y-4">
              {staff.map((member) => (
                <Card key={member.id || member.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          {member.experience_years && (
                            <span>Опыт: {member.experience_years} лет</span>
                          )}
                          {member.education && <span>Образование: {member.education}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStaff(member)}
                        >
                          ✏️
                        </Button>
                        {member.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStaff(member.id!)}
                            className="text-destructive"
                          >
                            🗑
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Стабильность коллектива */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Стабильность коллектива</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="turnover">Текучка кадров за последний год (%)</Label>
                  <Input
                    id="turnover"
                    type="number"
                    value={turnoverRate}
                    onChange={(e) => setTurnoverRate(parseInt(e.target.value) || 0)}
                    className="w-20"
                    min={0}
                    max={100}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  ℹ️ Норма рынка: 10-15%
                </p>
              </div>
              <div>
                <Label>Регулярное повышение квалификации</Label>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pd-yes"
                      checked={hasPdProgram === true}
                      onChange={() => setHasPdProgram(true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="pd-yes" className="cursor-pointer">
                      Да, есть программа PD
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pd-no"
                      checked={hasPdProgram === false}
                      onChange={() => setHasPdProgram(false)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="pd-no" className="cursor-pointer">
                      Нет
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Редактировать руководителя' : 'Добавить руководителя'}
            </DialogTitle>
            <DialogDescription>
              Публичная информация о руководстве школы
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Имя *</Label>
              <Input
                id="staff-name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="Иванова Мария Петровна"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-position">Должность *</Label>
              <Input
                id="staff-position"
                value={newStaff.position}
                onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                placeholder="Директор"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-experience">Опыт (лет)</Label>
              <Input
                id="staff-experience"
                type="number"
                value={newStaff.experience_years || ''}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, experience_years: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-education">Образование</Label>
              <Input
                id="staff-education"
                value={newStaff.education || ''}
                onChange={(e) => setNewStaff({ ...newStaff, education: e.target.value })}
                placeholder="ТГПУ, магистр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-bio">Биография</Label>
              <Textarea
                id="staff-bio"
                value={newStaff.bio || ''}
                onChange={(e) => setNewStaff({ ...newStaff, bio: e.target.value })}
                rows={4}
                placeholder="Краткая биография..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveStaff}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Кнопки действий */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button onClick={handleManualSave} disabled={loading || autosave.status === 'saving'}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  );
}

