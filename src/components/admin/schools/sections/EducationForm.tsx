'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator } from '../ProgressIndicator';
import { useAutosave, formatAutosaveStatus } from '@/lib/schools/autosave';
import { validateEducationSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';

interface EducationFormProps {
  schoolId: string;
  schoolDetails: any;
  currentProgress: number;
}

export function EducationForm({
  schoolId,
  schoolDetails,
  currentProgress,
}: EducationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Учебная программа
  const [curriculum, setCurriculum] = useState<string[]>(
    schoolDetails?.curriculum || []
  );
  const [curriculumDescription, setCurriculumDescription] = useState('');
  const [accreditations, setAccreditations] = useState<string[]>([]);

  // Языки
  const [primaryLanguage, setPrimaryLanguage] = useState(
    schoolDetails?.primary_language || 'uzbek'
  );
  const [languagesTaught, setLanguagesTaught] = useState<string[]>(['uzbek']);
  const [foreignLanguages, setForeignLanguages] = useState<string[]>([]);
  const [isBilingual, setIsBilingual] = useState(false);
  const [languageExams, setLanguageExams] = useState<string[]>([]);

  // Специализации
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [olympiadPrep, setOlympiadPrep] = useState<string[]>([]);
  const [examPrep, setExamPrep] = useState<string[]>([]);

  // Внеклассная деятельность
  const [extracurricularActivities, setExtracurricularActivities] = useState<
    Array<{ name: string; category: string }>
  >([]);
  const [sportsFacilities, setSportsFacilities] = useState<string[]>([]);

  const formData = {
    curriculum: curriculum.length > 0 ? curriculum : [],
    primary_language: primaryLanguage,
    languages_taught: languagesTaught,
    foreign_languages: foreignLanguages,
    accreditations: accreditations,
    focus_areas: focusAreas,
    olympiad_prep: olympiadPrep,
    exam_prep: examPrep,
  };

  const saveData = async (data: any) => {
    const response = await fetch(`/api/admin/schools/${schoolId}/sections/education`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        curriculum: data.curriculum,
        primary_language: data.primary_language,
        languages_taught: data.languages_taught,
        foreign_languages: data.foreign_languages,
        accreditations: data.accreditations,
        focus_areas: data.focus_areas,
        olympiad_prep: data.olympiad_prep,
        exam_prep: data.exam_prep,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save');
    }

    // Обновляем прогресс
    const progress = calculateSectionProgress('education', data);
    await fetch(`/api/admin/schools/${schoolId}/sections/education`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completeness: progress }),
    });

    // Также обновляем school_details
    await fetch(`/api/admin/schools/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization: {},
        school_details: {
          curriculum: data.curriculum,
          primary_language: data.primary_language,
        },
      }),
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

    const validation = validateEducationSection(formData);
    if (!validation.valid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    setValidationErrors({});

    try {
      await saveData(formData);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (arr: string[]) => void
  ) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const addExtracurricularActivity = () => {
    setExtracurricularActivities([...extracurricularActivities, { name: '', category: 'other' }]);
  };

  const removeExtracurricularActivity = (index: number) => {
    setExtracurricularActivities(extracurricularActivities.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Образовательная программа</CardTitle>
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
          {/* Учебная программа */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Учебная программа</h2>
            <div className="space-y-4">
              <div>
                <Label>Основная программа *</Label>
                <div className="flex gap-4 pt-2">
                  {[
                    { value: 'national', label: 'Национальная' },
                    { value: 'cambridge', label: 'Cambridge International' },
                    { value: 'ib', label: 'International Baccalaureate (IB)' },
                    { value: 'american', label: 'American' },
                    { value: 'mixed', label: 'Смешанная' },
                  ].map((prog) => (
                    <div key={prog.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`curriculum-${prog.value}`}
                        checked={curriculum.includes(prog.value)}
                        onCheckedChange={() =>
                          toggleArrayItem(curriculum, prog.value, setCurriculum)
                        }
                      />
                      <Label
                        htmlFor={`curriculum-${prog.value}`}
                        className="cursor-pointer"
                      >
                        {prog.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Аккредитации программы</Label>
                <div className="flex flex-col gap-2 pt-2">
                  {[
                    'Cambridge Assessment International Education',
                    'International Baccalaureate (IBO)',
                    'Pearson Edexcel',
                    'College Board (AP)',
                  ].map((acc) => (
                    <div key={acc} className="flex items-center space-x-2">
                      <Checkbox
                        id={`acc-${acc}`}
                        checked={accreditations.includes(acc)}
                        onCheckedChange={() =>
                          toggleArrayItem(accreditations, acc, setAccreditations)
                        }
                      />
                      <Label htmlFor={`acc-${acc}`} className="cursor-pointer">
                        {acc}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="curriculum-description">Описание программы</Label>
                <Textarea
                  id="curriculum-description"
                  value={curriculumDescription}
                  onChange={(e) => setCurriculumDescription(e.target.value)}
                  placeholder="Подробное описание образовательной программы..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Языки */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Языки</h2>
            <div className="space-y-4">
              <div>
                <Label>Языки обучения *</Label>
                <div className="flex gap-4 pt-2">
                  {['uzbek', 'russian', 'english'].map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-taught-${lang}`}
                        checked={languagesTaught.includes(lang)}
                        onCheckedChange={() =>
                          toggleArrayItem(languagesTaught, lang, setLanguagesTaught)
                        }
                      />
                      <Label
                        htmlFor={`lang-taught-${lang}`}
                        className="cursor-pointer capitalize"
                      >
                        {lang === 'uzbek'
                          ? "O'zbek"
                          : lang === 'russian'
                            ? 'Русский'
                            : 'English'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Билингвальное обучение?</Label>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="bilingual-yes"
                      checked={isBilingual === true}
                      onChange={() => setIsBilingual(true)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="bilingual-yes" className="cursor-pointer">
                      Да, два языка обучения
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="bilingual-no"
                      checked={isBilingual === false}
                      onChange={() => setIsBilingual(false)}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="bilingual-no" className="cursor-pointer">
                      Нет, один основной
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Иностранные языки (изучаемые)</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {['english', 'german', 'french', 'chinese', 'korean', 'arabic', 'japanese', 'spanish'].map(
                    (lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`foreign-${lang}`}
                          checked={foreignLanguages.includes(lang)}
                          onCheckedChange={() =>
                            toggleArrayItem(foreignLanguages, lang, setForeignLanguages)
                          }
                        />
                        <Label
                          htmlFor={`foreign-${lang}`}
                          className="cursor-pointer capitalize"
                        >
                          {lang}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <Label>Подготовка к языковым экзаменам</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {['ielts', 'cambridge', 'toefl', 'delf'].map((exam) => (
                    <div key={exam} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exam-${exam}`}
                        checked={languageExams.includes(exam)}
                        onCheckedChange={() =>
                          toggleArrayItem(languageExams, exam, setLanguageExams)
                        }
                      />
                      <Label
                        htmlFor={`exam-${exam}`}
                        className="cursor-pointer uppercase"
                      >
                        {exam}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Специализации */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Специализации и направления</h2>
            <div className="space-y-4">
              <div>
                <Label>Фокус образования</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    { value: 'stem', label: 'STEM (наука, технологии)' },
                    { value: 'academic', label: 'Академический' },
                    { value: 'humanities', label: 'Гуманитарный' },
                    { value: 'creative', label: 'Творческий' },
                    { value: 'sports', label: 'Спортивный' },
                  ].map((area) => (
                    <div key={area.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`focus-${area.value}`}
                        checked={focusAreas.includes(area.value)}
                        onCheckedChange={() =>
                          toggleArrayItem(focusAreas, area.value, setFocusAreas)
                        }
                      />
                      <Label htmlFor={`focus-${area.value}`} className="cursor-pointer">
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Подготовка к олимпиадам</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {['mathematics', 'physics', 'informatics', 'chemistry', 'biology', 'languages'].map(
                    (subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`olympiad-${subject}`}
                          checked={olympiadPrep.includes(subject)}
                          onCheckedChange={() =>
                            toggleArrayItem(olympiadPrep, subject, setOlympiadPrep)
                          }
                        />
                        <Label
                          htmlFor={`olympiad-${subject}`}
                          className="cursor-pointer capitalize"
                        >
                          {subject}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <Label>Подготовка к экзаменам</Label>
                <div className="flex gap-4 pt-2">
                  {['dtm', 'sat', 'act'].map((exam) => (
                    <div key={exam} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exam-prep-${exam}`}
                        checked={examPrep.includes(exam)}
                        onCheckedChange={() =>
                          toggleArrayItem(examPrep, exam, setExamPrep)
                        }
                      />
                      <Label
                        htmlFor={`exam-prep-${exam}`}
                        className="cursor-pointer uppercase"
                      >
                        {exam}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Внеклассная деятельность */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Внеклассная деятельность</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Кружки и секции</Label>
                  <Button variant="outline" size="sm" onClick={addExtracurricularActivity}>
                    + Добавить
                  </Button>
                </div>
                <div className="space-y-2">
                  {extracurricularActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <Input
                        placeholder="Название (например: Робототехника)"
                        value={activity.name}
                        onChange={(e) => {
                          const updated = [...extracurricularActivities];
                          updated[index].name = e.target.value;
                          setExtracurricularActivities(updated);
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExtracurricularActivity(index)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Спортивные секции</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {[
                    'football',
                    'swimming',
                    'basketball',
                    'volleyball',
                    'tennis',
                    'gymnastics',
                    'martial_arts',
                  ].map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sport-${sport}`}
                        checked={sportsFacilities.includes(sport)}
                        onCheckedChange={() =>
                          toggleArrayItem(sportsFacilities, sport, setSportsFacilities)
                        }
                      />
                      <Label
                        htmlFor={`sport-${sport}`}
                        className="cursor-pointer capitalize"
                      >
                        {sport.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

