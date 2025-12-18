'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Languages, BookOpen, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EducationSectionProps {
  data: {
    accepted_grades: number[];
    primary_languages: string[];
    curriculum: string[];
    pricing_tiers: Array<{ grades: number[]; price: number | null }>;
  };
  onDataChange: <K extends keyof EducationSectionProps['data']>(
    key: K,
    value: EducationSectionProps['data'][K]
  ) => void;
}

export function EducationSection({
  data,
  onDataChange,
}: EducationSectionProps) {
  const toggleGrade = (grade: number) => {
    if (data.accepted_grades.includes(grade)) {
      onDataChange(
        'accepted_grades',
        data.accepted_grades.filter((g) => g !== grade)
      );
    } else {
      onDataChange(
        'accepted_grades',
        [...data.accepted_grades, grade].sort((a, b) => a - b)
      );
    }
  };

  const toggleLanguage = (lang: string) => {
    if (data.primary_languages.includes(lang)) {
      onDataChange(
        'primary_languages',
        data.primary_languages.filter((l) => l !== lang)
      );
    } else {
      onDataChange('primary_languages', [...data.primary_languages, lang]);
    }
  };

  const toggleCurriculum = (cur: string) => {
    if (data.curriculum.includes(cur)) {
      onDataChange(
        'curriculum',
        data.curriculum.filter((c) => c !== cur)
      );
    } else {
      onDataChange('curriculum', [...data.curriculum, cur]);
    }
  };

  const addPricingTier = () => {
    onDataChange('pricing_tiers', [
      ...data.pricing_tiers,
      { grades: [], price: null },
    ]);
  };

  const updatePricingTier = (
    index: number,
    updates: Partial<EducationSectionProps['data']['pricing_tiers'][0]>
  ) => {
    const newTiers = [...data.pricing_tiers];
    newTiers[index] = { ...newTiers[index], ...updates };
    onDataChange('pricing_tiers', newTiers);
  };

  const removePricingTier = (index: number) => {
    onDataChange(
      'pricing_tiers',
      data.pricing_tiers.filter((_, i) => i !== index)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          3. Ta'lim va narx
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Qabul sinflari *
            </Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => {
                const isSelected = data.accepted_grades.includes(grade);
                return (
                  <Button
                    key={grade}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleGrade(grade)}
                    className={cn(
                      'min-w-[50px]',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {grade === 0 ? '0 (Tayyorgarlik)' : grade}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Ta'lim tili *
            </Label>
            <div className="flex gap-2 pt-2">
              {['uzbek', 'russian', 'english'].map((lang) => {
                const isSelected = data.primary_languages.includes(lang);
                const label =
                  lang === 'uzbek'
                    ? "O'zbek"
                    : lang === 'russian'
                      ? 'Rus'
                      : 'Ingliz';
                return (
                  <Button
                    key={lang}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLanguage(lang)}
                    className={cn(
                      'min-w-[100px]',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              O'quv dasturi *
            </Label>
            <div className="flex gap-2 pt-2">
              {['national', 'cambridge', 'ib'].map((cur) => {
                const isSelected = data.curriculum.includes(cur);
                const label =
                  cur === 'national'
                    ? 'Milliy'
                    : cur === 'cambridge'
                      ? 'Cambridge'
                      : 'IB';
                return (
                  <Button
                    key={cur}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCurriculum(cur)}
                    className={cn(
                      'min-w-[100px]',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Narxlar (sinflar bo'yicha)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPricingTier}
              >
                + Narx qo'shish
              </Button>
            </div>
            <div className="space-y-3 pt-2">
              {data.pricing_tiers.map((tier, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-end p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Sinflar
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => {
                        const isSelected = tier.grades.includes(grade);
                        return (
                          <Button
                            key={grade}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const newGrades = isSelected
                                ? tier.grades.filter((g) => g !== grade)
                                : [...tier.grades, grade].sort((a, b) => a - b);
                              updatePricingTier(index, { grades: newGrades });
                            }}
                            className={cn(
                              'h-7 px-2 text-xs',
                              isSelected && 'bg-primary text-primary-foreground'
                            )}
                          >
                            {grade === 0 ? '0' : grade}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="w-32">
                    <Label className="text-xs text-muted-foreground">
                      Narx (so'm)
                    </Label>
                    <Input
                      type="number"
                      value={tier.price || ''}
                      onChange={(e) =>
                        updatePricingTier(index, {
                          price: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePricingTier(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {data.pricing_tiers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Narxlar qo'shilmagan. "Narx qo'shish" tugmasini bosing.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

