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
import { Checkbox } from '@/components/ui/checkbox';
import { useAutosave, formatAutosaveStatus } from '@/lib/schools/autosave';
import { validateEducationSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';

interface EducationFormProps {
  organization: any;
  schoolDetails?: any;
}

export function EducationForm({ organization, schoolDetails }: EducationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Учебная программа
  const [curriculum, setCurriculum] = useState<string[]>(
    schoolDetails?.curriculum || []
  );
  const [primaryLanguage, setPrimaryLanguage] = useState(
    schoolDetails?.primary_language || 'uzbek'
  );

  // Языки обучения
  const [languagesTaught, setLanguagesTaught] = useState<string[]>([]);
  const [isBilingual, setIsBilingual] = useState(false);
  const [foreignLanguages, setForeignLanguages] = useState<string[]>([]);
  const [languageExams, setLanguageExams] = useState<string[]>([]);

  // Аккредитации
  const [accreditations, setAccreditations] = useState<string[]>([]);
  const [programDescription, setProgramDescription] = useState('');

  // Специализации
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [olympiadSubjects, setOlympiadSubjects] = useState<string[]>([]);
  const [examPreparation, setExamPreparation] = useState<string[]>([]);

  // Внеклассная деятельность
  const [extracurricularActivities, setExtracurricularActivities] = useState<
    Array<{ name: string; category: string }>
  >([]);
  const [sports, setSports] = useState<string[]>([]);

  const formData = {
    curriculum,
    primary_language: primaryLanguage,
    languages_taught: languagesTaught,
    foreign_languages: foreignLanguages,
    accreditations,
  };

  const { status: autosaveStatus, save } = useAutosave({
    data: formData,
    onSave: async (data) => {
      const progress = calculateSectionProgress('education', data);
      const validation = validateEducationSection(data);

      if (!validation.valid) {
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
        throw new Error('Validation failed');
      }

      setValidationErrors({});

      const response = await fetch(`/api/admin/schools/${organization.id}`, {
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

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      await fetch(`/api/admin/schools/${organization.id}/sections/education`, {
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

  const toggleArray = (
    array: string[],
    value: string,
    setter: (arr: string[]) => void
  ) => {
    setter(array.includes(value) ? array.filter((v) => v !== value) : [...array, value]);
  };

  const addExtracurricular = () => {
    setExtracurricularActivities([...extracurricularActivities, { name: '', category: '' }]);
  };

  const removeExtracurricular = (index: number) => {
    setExtracurricularActivities(extracurricularActivities.filter((_, i) => i !== index));
  };

  return (
    <form className="space-y-8">
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span className="text-sm text-muted-foreground">
          {formatAutosaveStatus(autosaveStatus)}
        </span>
        <Button type="button" onClick={handleManualSave} size="sm" variant="outline">
          Сохранить
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Учебная программа */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">УЧЕБНАЯ ПРОГРАММА</h2>

        <div className="space-y-2">
          <Label>Основная программа *</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['national', 'cambridge', 'ib', 'american', 'mixed'].map((prog) => (
              <div key={prog} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="curriculum"
                  id={`curriculum-${prog}`}
                  checked={curriculum.includes(prog)}
                  onChange={() => setCurriculum([prog])}
                  className="w-4 h-4"
                />
                <Label htmlFor={`curriculum-${prog}`} className="cursor-pointer capitalize">
                  {prog === 'national'
                    ? 'Национальная'
                    : prog === 'cambridge'
                      ? 'Cambridge'
                      : prog === 'ib'
                        ? 'IB'
                        : prog === 'american'
                          ? 'American'
                          : 'Смешанная'}
                </Label>
              </div>
            ))}
          </div>
          {validationErrors.curriculum && (
            <p className="text-sm text-destructive">{validationErrors.curriculum}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Аккредитации программы</Label>
          <div className="space-y-2">
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
                    toggleArray(accreditations, acc, setAccreditations)
                  }
                />
                <Label htmlFor={`acc-${acc}`} className="cursor-pointer">
                  {acc}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="programDescription">Описание программы</Label>
          <Textarea
            id="programDescription"
            value={programDescription}
            onChange={(e) => setProgramDescription(e.target.value)}
            placeholder="Наша школа работает по программе Cambridge IGCSE для средних классов и A-Level для старших..."
            rows={4}
          />
        </div>
      </div>

      {/* Языки */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ЯЗЫКИ</h2>

        <div className="space-y-2">
          <Label>Языки обучения *</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['russian', 'uzbek', 'english'].map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang-${lang}`}
                  checked={languagesTaught.includes(lang)}
                  onCheckedChange={() =>
                    toggleArray(languagesTaught, lang, setLanguagesTaught)
                  }
                />
                <Label htmlFor={`lang-${lang}`} className="cursor-pointer capitalize">
                  {lang === 'russian' ? 'Русский' : lang === 'uzbek' ? 'Узбекский' : 'English'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Билингвальное обучение?</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="bilingual"
                id="bilingual-yes"
                checked={isBilingual}
                onChange={() => setIsBilingual(true)}
                className="w-4 h-4"
              />
              <Label htmlFor="bilingual-yes" className="cursor-pointer">
                Да, два языка обучения
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="bilingual"
                id="bilingual-no"
                checked={!isBilingual}
                onChange={() => setIsBilingual(false)}
                className="w-4 h-4"
              />
              <Label htmlFor="bilingual-no" className="cursor-pointer">
                Нет, один основной
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Иностранные языки (изучаемые)</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['english', 'german', 'french', 'chinese', 'korean', 'arabic', 'japanese', 'spanish'].map(
              (lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={`foreign-${lang}`}
                    checked={foreignLanguages.includes(lang)}
                    onCheckedChange={() =>
                      toggleArray(foreignLanguages, lang, setForeignLanguages)
                    }
                  />
                  <Label htmlFor={`foreign-${lang}`} className="cursor-pointer capitalize">
                    {lang}
                  </Label>
                </div>
              )
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Подготовка к языковым экзаменам</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['ielts', 'cambridge', 'toefl', 'delf'].map((exam) => (
              <div key={exam} className="flex items-center space-x-2">
                <Checkbox
                  id={`exam-${exam}`}
                  checked={languageExams.includes(exam)}
                  onCheckedChange={() => toggleArray(languageExams, exam, setLanguageExams)}
                />
                <Label htmlFor={`exam-${exam}`} className="cursor-pointer uppercase">
                  {exam}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Специализации */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">СПЕЦИАЛИЗАЦИИ И НАПРАВЛЕНИЯ</h2>

        <div className="space-y-2">
          <Label>Фокус образования</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['stem', 'academic', 'humanities', 'creative', 'sports'].map((focus) => (
              <div key={focus} className="flex items-center space-x-2">
                <Checkbox
                  id={`focus-${focus}`}
                  checked={focusAreas.includes(focus)}
                  onCheckedChange={() => toggleArray(focusAreas, focus, setFocusAreas)}
                />
                <Label htmlFor={`focus-${focus}`} className="cursor-pointer capitalize">
                  {focus === 'stem'
                    ? 'STEM (наука, технологии)'
                    : focus === 'academic'
                      ? 'Академический'
                      : focus === 'humanities'
                        ? 'Гуманитарный'
                        : focus === 'creative'
                          ? 'Творческий'
                          : 'Спортивный'}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Подготовка к олимпиадам</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['mathematics', 'physics', 'informatics', 'chemistry', 'biology', 'languages'].map(
              (subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={`olympiad-${subject}`}
                    checked={olympiadSubjects.includes(subject)}
                    onCheckedChange={() =>
                      toggleArray(olympiadSubjects, subject, setOlympiadSubjects)
                    }
                  />
                  <Label htmlFor={`olympiad-${subject}`} className="cursor-pointer capitalize">
                    {subject === 'mathematics'
                      ? 'Математика'
                      : subject === 'physics'
                        ? 'Физика'
                        : subject === 'informatics'
                          ? 'Информатика'
                          : subject === 'chemistry'
                            ? 'Химия'
                            : subject === 'biology'
                              ? 'Биология'
                              : 'Языки'}
                  </Label>
                </div>
              )
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Подготовка к экзаменам</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['dtm', 'sat', 'act'].map((exam) => (
              <div key={exam} className="flex items-center space-x-2">
                <Checkbox
                  id={`prep-${exam}`}
                  checked={examPreparation.includes(exam)}
                  onCheckedChange={() =>
                    toggleArray(examPreparation, exam, setExamPreparation)
                  }
                />
                <Label htmlFor={`prep-${exam}`} className="cursor-pointer uppercase">
                  {exam}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Внеклассная деятельность */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ВНЕКЛАССНАЯ ДЕЯТЕЛЬНОСТЬ</h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Кружки и секции</Label>
            <Button type="button" variant="outline" size="sm" onClick={addExtracurricular}>
              + Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {extracurricularActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Название кружка"
                  value={activity.name}
                  onChange={(e) => {
                    const updated = [...extracurricularActivities];
                    updated[index].name = e.target.value;
                    setExtracurricularActivities(updated);
                  }}
                />
                <Select
                  value={activity.category}
                  onValueChange={(value) => {
                    const updated = [...extracurricularActivities];
                    updated[index].category = value;
                    setExtracurricularActivities(updated);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stem">STEM</SelectItem>
                    <SelectItem value="intellect">Интеллект</SelectItem>
                    <SelectItem value="creative">Творчество</SelectItem>
                    <SelectItem value="sports">Спорт</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExtracurricular(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Спортивные секции</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['football', 'swimming', 'basketball', 'volleyball', 'tennis', 'gymnastics', 'martial_arts'].map(
              (sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport}`}
                    checked={sports.includes(sport)}
                    onCheckedChange={() => toggleArray(sports, sport, setSports)}
                  />
                  <Label htmlFor={`sport-${sport}`} className="cursor-pointer capitalize">
                    {sport === 'football'
                      ? 'Футбол'
                      : sport === 'swimming'
                        ? 'Плавание'
                        : sport === 'basketball'
                          ? 'Баскетбол'
                          : sport === 'volleyball'
                            ? 'Волейбол'
                            : sport === 'tennis'
                              ? 'Теннис'
                              : sport === 'gymnastics'
                                ? 'Гимнастика'
                                : 'Единоборства'}
                  </Label>
                </div>
              )
            )}
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

