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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface WizardData {
  // Step 1: Basic
  name_uz: string;
  name_ru: string;
  school_type: string;
  description: string;
  logo_url?: string;

  // Step 2: Contacts
  phone: string;
  email: string;
  website: string;
  telegram: string;
  region_id: number | null;
  district_id: number | null;
  address: string;
  landmark: string;
  lat?: number;
  lng?: number;

  // Step 3: Education
  grade_from: number;
  grade_to: number;
  accepts_preparatory: boolean;
  primary_language: string;
  curriculum: string[];
  fee_monthly_min: number;
  fee_monthly_max: number;
  currency: string;
  price_negotiable: boolean;
}

interface SchoolCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolCreationWizard({
  open,
  onOpenChange,
}: SchoolCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<WizardData>({
    name_uz: '',
    name_ru: '',
    school_type: 'private',
    description: '',
    phone: '',
    email: '',
    website: '',
    telegram: '',
    region_id: null,
    district_id: null,
    address: '',
    landmark: '',
    grade_from: 1,
    grade_to: 11,
    accepts_preparatory: false,
    primary_language: 'uzbek',
    curriculum: [],
    fee_monthly_min: 0,
    fee_monthly_max: 0,
    currency: 'UZS',
    price_negotiable: false,
  });

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    if (step === 1) {
      if (!data.name_uz && !data.name_ru) {
        setError('Kamida bitta nom (uz yoki ru) kiritilishi kerak');
        return false;
      }
      if (!data.description || data.description.length < 50) {
        setError('Tavsif kamida 50 ta belgi bo\'lishi kerak');
        return false;
      }
    }

    if (step === 2) {
      if (!data.phone) {
        setError('Telefon raqami kiritilishi kerak');
        return false;
      }
      if (!data.email) {
        setError('Email kiritilishi kerak');
        return false;
      }
      if (!data.region_id || !data.district_id) {
        setError('Viloyat va tuman tanlanishi kerak');
        return false;
      }
      if (!data.address) {
        setError('Manzil kiritilishi kerak');
        return false;
      }
    }

    if (step === 3) {
      if (data.fee_monthly_min <= 0 || data.fee_monthly_max <= 0) {
        setError('Narxlar kiritilishi kerak');
        return false;
      }
      if (data.fee_monthly_min > data.fee_monthly_max) {
        setError('Minimal narx maksimaldan katta bo\'lishi mumkin emas');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const slug = generateSlug(data.name_uz || data.name_ru || 'school');

      const organizationData = {
        org_type: 'school',
        name: data.name_uz || data.name_ru || 'School',
        name_uz: data.name_uz || null,
        name_ru: data.name_ru || null,
        slug,
        description: data.description,
        status: 'draft',
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        telegram: data.telegram || null,
        region_id: data.region_id,
        district_id: data.district_id,
        address: data.address,
        landmark: data.landmark || null,
        lat: data.lat || null,
        lng: data.lng || null,
      };

      const schoolDetailsData = {
        school_type: data.school_type,
        grade_from: data.grade_from,
        grade_to: data.grade_to,
        accepts_preparatory: data.accepts_preparatory,
        primary_language: data.primary_language,
        curriculum: data.curriculum.length > 0 ? data.curriculum : null,
        fee_monthly_min: data.fee_monthly_min,
        fee_monthly_max: data.fee_monthly_max,
      };

      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: organizationData,
          school_details: schoolDetailsData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Xatolik yuz berdi');
      }

      // Успешно создано, перенаправляем на страницу редактирования
      router.push(`/admin/schools/${result.id}`);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const updateData = <K extends keyof WizardData>(
    key: K,
    value: WizardData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить школу</DialogTitle>
          <DialogDescription>
            Заполните форму для добавления новой школы
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-muted text-muted-foreground'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 mb-4">
            {error}
          </div>
        )}

        {/* Step Content */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Основная информация</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name_uz">Название школы (O'zbekcha) *</Label>
                    <Input
                      id="name_uz"
                      value={data.name_uz}
                      onChange={(e) => updateData('name_uz', e.target.value)}
                      placeholder="Cambridge School Tashkent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name_ru">Название школы (Русский)</Label>
                    <Input
                      id="name_ru"
                      value={data.name_ru}
                      onChange={(e) => updateData('name_ru', e.target.value)}
                      placeholder="Cambridge School Tashkent"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="school_type">Тип школы *</Label>
                    <Select
                      value={data.school_type}
                      onValueChange={(value) => updateData('school_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Частная</SelectItem>
                        <SelectItem value="international">Международная</SelectItem>
                        <SelectItem value="state">Государственная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Краткое описание *</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => updateData('description', e.target.value)}
                      placeholder="Международная школа с Cambridge программой..."
                      rows={4}
                      maxLength={200}
                    />
                    <p className="text-sm text-muted-foreground">
                      {data.description.length}/200 символов
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Контакты и адрес</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => updateData('phone', e.target.value)}
                      placeholder="+998901234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateData('email', e.target.value)}
                      placeholder="info@school.uz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Сайт</Label>
                    <Input
                      id="website"
                      type="url"
                      value={data.website}
                      onChange={(e) => updateData('website', e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      value={data.telegram}
                      onChange={(e) => updateData('telegram', e.target.value)}
                      placeholder="@"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Район *</Label>
                    <Select
                      value={data.district_id?.toString() || ''}
                      onValueChange={(value) =>
                        updateData('district_id', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите район" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Здесь нужно загрузить районы через API */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Город *</Label>
                    <Input
                      id="city"
                      value="Ташкент"
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Адрес *</Label>
                    <Input
                      id="address"
                      value={data.address}
                      onChange={(e) => updateData('address', e.target.value)}
                      placeholder="ул. Шота Руставели, 12"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="landmark">Ориентир</Label>
                    <Input
                      id="landmark"
                      value={data.landmark}
                      onChange={(e) => updateData('landmark', e.target.value)}
                      placeholder="Рядом с..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Обучение и стоимость</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="grade_from">Классы (от) *</Label>
                    <Select
                      value={data.grade_from.toString()}
                      onValueChange={(value) =>
                        updateData('grade_from', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            {grade === 0 ? '0 (Подготовительный)' : grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade_to">Классы (до) *</Label>
                    <Select
                      value={data.grade_to.toString()}
                      onValueChange={(value) =>
                        updateData('grade_to', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="primary_language">Язык обучения *</Label>
                    <div className="flex gap-4 pt-2">
                      {['uzbek', 'russian', 'english'].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang}`}
                            checked={data.primary_language === lang}
                            onCheckedChange={() => updateData('primary_language', lang)}
                          />
                          <Label
                            htmlFor={`lang-${lang}`}
                            className="cursor-pointer capitalize"
                          >
                            {lang === 'uzbek'
                              ? 'O\'zbek'
                              : lang === 'russian'
                                ? 'Русский'
                                : 'English'}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Учебная программа *</Label>
                    <div className="flex gap-4 pt-2">
                      {[
                        { value: 'national', label: 'Национальная' },
                        { value: 'cambridge', label: 'Cambridge' },
                        { value: 'ib', label: 'IB' },
                      ].map((prog) => (
                        <div key={prog.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`curriculum-${prog.value}`}
                            checked={data.curriculum.includes(prog.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateData('curriculum', [...data.curriculum, prog.value]);
                              } else {
                                updateData(
                                  'curriculum',
                                  data.curriculum.filter((c) => c !== prog.value)
                                );
                              }
                            }}
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
                  <div className="space-y-2">
                    <Label htmlFor="fee_min">Стоимость (от, сум) *</Label>
                    <Input
                      id="fee_min"
                      type="number"
                      value={data.fee_monthly_min}
                      onChange={(e) =>
                        updateData('fee_monthly_min', parseFloat(e.target.value) || 0)
                      }
                      placeholder="3000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee_max">Стоимость (до, сум) *</Label>
                    <Input
                      id="fee_max"
                      type="number"
                      value={data.fee_monthly_max}
                      onChange={(e) =>
                        updateData('fee_monthly_max', parseFloat(e.target.value) || 0)
                      }
                      placeholder="5000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Валюта</Label>
                    <Select
                      value={data.currency}
                      onValueChange={(value) => updateData('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UZS">UZS</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="price_negotiable"
                      checked={data.price_negotiable}
                      onCheckedChange={(checked) =>
                        updateData('price_negotiable', checked === true)
                      }
                    />
                    <Label htmlFor="price_negotiable" className="cursor-pointer">
                      Цена договорная (не показывать)
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
            disabled={loading}
          >
            {currentStep === 1 ? 'Отмена' : 'Назад'}
          </Button>
          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={loading}>
              Далее →
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Создание...' : 'Создать школу ✓'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
