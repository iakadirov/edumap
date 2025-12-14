'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAutosave, formatAutosaveStatus } from '@/lib/schools/autosave';
import { validateResultsSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';

interface ResultsFormProps {
  organization: any;
  initialResults?: any[];
}

export function ResultsForm({ organization, initialResults = [] }: ResultsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Результаты выпускников
  const [totalGraduates, setTotalGraduates] = useState<number>(0);
  const [graduatesToUniversities, setGraduatesToUniversities] = useState<number>(0);
  const [graduatesOnGrants, setGraduatesOnGrants] = useState<number>(0);
  const [graduatesToTopUzUniversities, setGraduatesToTopUzUniversities] = useState<number>(0);
  const [graduatesToForeignUniversities, setGraduatesToForeignUniversities] = useState<number>(0);
  const [topUniversitiesUz, setTopUniversitiesUz] = useState<string[]>([]);
  const [foreignUniversities, setForeignUniversities] = useState<string[]>([]);

  // Результаты экзаменов
  const [avgDtmScore, setAvgDtmScore] = useState<number | null>(null);
  const [avgIeltsScore, setAvgIeltsScore] = useState<number | null>(null);
  const [avgSatScore, setAvgSatScore] = useState<number | null>(null);
  const [studentsWithIelts7plus, setStudentsWithIelts7plus] = useState<number>(0);
  const [studentsWithIelts8plus, setStudentsWithIelts8plus] = useState<number>(0);

  // Олимпиады
  const [olympiadMedalsInternational, setOlympiadMedalsInternational] = useState<number>(0);
  const [olympiadMedalsNational, setOlympiadMedalsNational] = useState<number>(0);
  const [olympiadMedalsCity, setOlympiadMedalsCity] = useState<number>(0);
  const [olympiadSubjects, setOlympiadSubjects] = useState<string[]>([]);

  // Награды школы
  const [schoolAwards, setSchoolAwards] = useState<Array<{ year: number; title: string; organization: string }>>([]);

  // Загружаем данные за выбранный год
  const currentYearData = initialResults.find((r) => r.year === selectedYear);

  useState(() => {
    if (currentYearData) {
      setTotalGraduates(currentYearData.total_graduates || 0);
      setGraduatesToUniversities(currentYearData.graduates_to_universities || 0);
      setGraduatesOnGrants(currentYearData.graduates_on_grants || 0);
      setGraduatesToTopUzUniversities(currentYearData.graduates_to_top_uz_universities || 0);
      setGraduatesToForeignUniversities(currentYearData.graduates_to_foreign_universities || 0);
      setTopUniversitiesUz(currentYearData.top_universities_uz || []);
      setForeignUniversities(currentYearData.foreign_universities || []);
      setAvgDtmScore(currentYearData.avg_dtm_score || null);
      setAvgIeltsScore(currentYearData.avg_ielts_score || null);
      setAvgSatScore(currentYearData.avg_sat_score || null);
      setStudentsWithIelts7plus(currentYearData.students_with_ielts_7plus || 0);
      setStudentsWithIelts8plus(currentYearData.students_with_ielts_8plus || 0);
      setOlympiadMedalsInternational(currentYearData.olympiad_medals_international || 0);
      setOlympiadMedalsNational(currentYearData.olympiad_medals_national || 0);
      setOlympiadMedalsCity(currentYearData.olympiad_medals_city || 0);
      setOlympiadSubjects(currentYearData.olympiad_subjects || []);
      if (currentYearData.school_awards) {
        setSchoolAwards(Array.isArray(currentYearData.school_awards) ? currentYearData.school_awards : []);
      }
    }
  });

  const formData = {
    results: [
      {
        year: selectedYear,
        total_graduates: totalGraduates,
        graduates_to_universities: graduatesToUniversities,
        avg_ielts_score: avgIeltsScore,
      },
    ],
  };

  const { status: autosaveStatus, save } = useAutosave({
    data: formData,
    onSave: async (data) => {
      const progress = calculateSectionProgress('results', data);
      const validation = validateResultsSection(data);

      if (!validation.valid) {
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
        throw new Error('Validation failed');
      }

      setValidationErrors({});

      // Сохраняем результаты за год
      const resultData = {
        year: selectedYear,
        total_graduates: totalGraduates,
        graduates_to_universities: graduatesToUniversities,
        graduates_on_grants: graduatesOnGrants,
        graduates_to_top_uz_universities: graduatesToTopUzUniversities,
        graduates_to_foreign_universities: graduatesToForeignUniversities,
        top_universities_uz: topUniversitiesUz,
        foreign_universities: foreignUniversities,
        avg_dtm_score: avgDtmScore,
        avg_ielts_score: avgIeltsScore,
        avg_sat_score: avgSatScore,
        students_with_ielts_7plus: studentsWithIelts7plus,
        students_with_ielts_8plus: studentsWithIelts8plus,
        olympiad_medals_international: olympiadMedalsInternational,
        olympiad_medals_national: olympiadMedalsNational,
        olympiad_medals_city: olympiadMedalsCity,
        olympiad_subjects: olympiadSubjects,
        school_awards: schoolAwards,
      };

      const response = await fetch(`/api/admin/schools/${organization.id}/results`, {
        method: currentYearData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to save: ${response.status} ${response.statusText}`;
        console.error('Error saving results:', errorMessage, errorData);
        throw new Error(errorMessage);
      }

      await fetch(`/api/admin/schools/${organization.id}/sections/results`, {
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

  const toggleArray = (array: string[], value: string, setter: (arr: string[]) => void) => {
    setter(array.includes(value) ? array.filter((v) => v !== value) : [...array, value]);
  };

  const addForeignUniversity = () => {
    const name = prompt('Введите название университета:');
    if (name) {
      setForeignUniversities([...foreignUniversities, name]);
    }
  };

  const removeForeignUniversity = (index: number) => {
    setForeignUniversities(foreignUniversities.filter((_, i) => i !== index));
  };

  const addAward = () => {
    setSchoolAwards([...schoolAwards, { year: selectedYear, title: '', organization: '' }]);
  };

  const removeAward = (index: number) => {
    setSchoolAwards(schoolAwards.filter((_, i) => i !== index));
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

      {/* Результаты выпускников */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">РЕЗУЛЬТАТЫ ВЫПУСКНИКОВ</h2>
          <span className="text-sm text-muted-foreground">📊 +15 баллов к рейтингу</span>
        </div>

        <div className="space-y-2">
          <Label>Выберите год:</Label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="totalGraduates">Всего выпускников</Label>
            <Input
              id="totalGraduates"
              type="number"
              value={totalGraduates || ''}
              onChange={(e) => setTotalGraduates(parseInt(e.target.value) || 0)}
              placeholder="45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduatesToUni">Поступили в вузы (%)</Label>
            <Input
              id="graduatesToUni"
              type="number"
              min="0"
              max="100"
              value={graduatesToUniversities || ''}
              onChange={(e) => setGraduatesToUniversities(parseInt(e.target.value) || 0)}
              placeholder="95"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduatesOnGrants">Поступили на грант (%)</Label>
            <Input
              id="graduatesOnGrants"
              type="number"
              min="0"
              max="100"
              value={graduatesOnGrants || ''}
              onChange={(e) => setGraduatesOnGrants(parseInt(e.target.value) || 0)}
              placeholder="35"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduatesTopUz">В топ-вузы УЗ (%)</Label>
            <Input
              id="graduatesTopUz"
              type="number"
              min="0"
              max="100"
              value={graduatesToTopUzUniversities || ''}
              onChange={(e) => setGraduatesToTopUzUniversities(parseInt(e.target.value) || 0)}
              placeholder="40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduatesForeign">В зарубежные вузы (%)</Label>
            <Input
              id="graduatesForeign"
              type="number"
              min="0"
              max="100"
              value={graduatesToForeignUniversities || ''}
              onChange={(e) => setGraduatesToForeignUniversities(parseInt(e.target.value) || 0)}
              placeholder="25"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Топ вузы куда поступили (выберите)</Label>
          <p className="text-sm text-muted-foreground">Узбекистан:</p>
          <div className="flex flex-wrap gap-4 pt-2">
            {['UWED', 'Westminster', 'INHA', 'TGYU', 'TGEU'].map((uni) => (
              <div key={uni} className="flex items-center space-x-2">
                <Checkbox
                  id={`uz-uni-${uni}`}
                  checked={topUniversitiesUz.includes(uni)}
                  onCheckedChange={() => toggleArray(topUniversitiesUz, uni, setTopUniversitiesUz)}
                />
                <Label htmlFor={`uz-uni-${uni}`} className="cursor-pointer">
                  {uni}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>За рубежом:</Label>
            <Button type="button" variant="outline" size="sm" onClick={addForeignUniversity}>
              + Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {foreignUniversities.map((uni, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={uni} readOnly />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeForeignUniversity(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Результаты экзаменов */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">РЕЗУЛЬТАТЫ ЭКЗАМЕНОВ</h2>
          <span className="text-sm text-muted-foreground">📊 +10 баллов</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="avgDtm">Средний балл DTM</Label>
            <Input
              id="avgDtm"
              type="number"
              min="0"
              max="100"
              value={avgDtmScore || ''}
              onChange={(e) => setAvgDtmScore(parseFloat(e.target.value) || null)}
              placeholder="185"
            />
            {validationErrors['results[0].avg_dtm_score'] && (
              <p className="text-sm text-destructive">
                {validationErrors['results[0].avg_dtm_score']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgIelts">Средний балл IELTS</Label>
            <Input
              id="avgIelts"
              type="number"
              step="0.1"
              min="0"
              max="9.0"
              value={avgIeltsScore || ''}
              onChange={(e) => setAvgIeltsScore(parseFloat(e.target.value) || null)}
              placeholder="7.0"
            />
            {validationErrors['results[0].avg_ielts_score'] && (
              <p className="text-sm text-destructive">
                {validationErrors['results[0].avg_ielts_score']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgSat">Средний балл SAT</Label>
            <Input
              id="avgSat"
              type="number"
              min="400"
              max="1600"
              value={avgSatScore || ''}
              onChange={(e) => setAvgSatScore(parseInt(e.target.value) || null)}
              placeholder="1350"
            />
            {validationErrors['results[0].avg_sat_score'] && (
              <p className="text-sm text-destructive">
                {validationErrors['results[0].avg_sat_score']}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ielts7plus">Учеников с IELTS 7.0+</Label>
            <Input
              id="ielts7plus"
              type="number"
              value={studentsWithIelts7plus || ''}
              onChange={(e) => setStudentsWithIelts7plus(parseInt(e.target.value) || 0)}
              placeholder="35"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ielts8plus">Учеников с IELTS 8.0+</Label>
            <Input
              id="ielts8plus"
              type="number"
              value={studentsWithIelts8plus || ''}
              onChange={(e) => setStudentsWithIelts8plus(parseInt(e.target.value) || 0)}
              placeholder="12"
            />
          </div>
        </div>
      </div>

      {/* Олимпиады */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">ОЛИМПИАДЫ И КОНКУРСЫ</h2>
          <span className="text-sm text-muted-foreground">📊 +10 баллов</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="olympiadInt">Международные олимпиады</Label>
            <Input
              id="olympiadInt"
              type="number"
              value={olympiadMedalsInternational || ''}
              onChange={(e) => setOlympiadMedalsInternational(parseInt(e.target.value) || 0)}
              placeholder="3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="olympiadNat">Республиканские</Label>
            <Input
              id="olympiadNat"
              type="number"
              value={olympiadMedalsNational || ''}
              onChange={(e) => setOlympiadMedalsNational(parseInt(e.target.value) || 0)}
              placeholder="15"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="olympiadCity">Городские</Label>
            <Input
              id="olympiadCity"
              type="number"
              value={olympiadMedalsCity || ''}
              onChange={(e) => setOlympiadMedalsCity(parseInt(e.target.value) || 0)}
              placeholder="25"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>По каким предметам</Label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['mathematics', 'physics', 'informatics', 'chemistry', 'biology'].map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`olympiad-subj-${subject}`}
                  checked={olympiadSubjects.includes(subject)}
                  onCheckedChange={() =>
                    toggleArray(olympiadSubjects, subject, setOlympiadSubjects)
                  }
                />
                <Label htmlFor={`olympiad-subj-${subject}`} className="cursor-pointer capitalize">
                  {subject === 'mathematics'
                    ? 'Математика'
                    : subject === 'physics'
                      ? 'Физика'
                      : subject === 'informatics'
                        ? 'Информатика'
                        : subject === 'chemistry'
                          ? 'Химия'
                          : 'Биология'}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Награды школы */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">НАГРАДЫ ШКОЛЫ</h2>
        <div className="space-y-2">
          {schoolAwards.map((award, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={award.year || ''}
                    onChange={(e) => {
                      const updated = [...schoolAwards];
                      updated[index].year = parseInt(e.target.value) || new Date().getFullYear();
                      setSchoolAwards(updated);
                    }}
                    className="w-24"
                    placeholder="Год"
                  />
                  <Input
                    value={award.title}
                    onChange={(e) => {
                      const updated = [...schoolAwards];
                      updated[index].title = e.target.value;
                      setSchoolAwards(updated);
                    }}
                    placeholder="Название награды"
                  />
                  <Input
                    value={award.organization}
                    onChange={(e) => {
                      const updated = [...schoolAwards];
                      updated[index].organization = e.target.value;
                      setSchoolAwards(updated);
                    }}
                    placeholder="Организация"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAward(index)}
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={addAward}>
            + Добавить награду
          </Button>
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

