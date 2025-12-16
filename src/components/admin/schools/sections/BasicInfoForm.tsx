'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator } from '../ProgressIndicator';
import { LogoUpload } from '../LogoUpload';
import { CoverImageUpload } from '../CoverImageUpload';
import { useToast } from '@/contexts/ToastContext';
import { useAutosave, formatAutosaveStatus } from '@/lib/schools/autosave';
import { validateBasicSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';
import { saveTelegram } from '@/lib/utils/telegram';
import { YandexMap } from '../YandexMap';

interface BasicInfoFormProps {
  organization: any;
  schoolDetails: any;
  regions: any[];
  districts: any[];
  currentProgress: number;
}

export function BasicInfoForm({
  organization,
  schoolDetails,
  regions,
  districts: initialDistricts,
  currentProgress: initialProgress,
}: BasicInfoFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentProgress, setCurrentProgress] = useState(initialProgress);

  // Основная информация
  const [nameUz, setNameUz] = useState(organization?.name_uz || '');
  const [shortDescription, setShortDescription] = useState(organization?.short_description || '');
  const [description, setDescription] = useState(organization?.description || '');

  // Контакты
  const [phone, setPhone] = useState(organization?.phone || '');
  const [phone2, setPhone2] = useState(organization?.phone_secondary || '');
  const [phone2Comment, setPhone2Comment] = useState(organization?.phone_secondary_comment || '');
  const [phone3, setPhone3] = useState(organization?.phone_admission || '');
  const [phone3Comment, setPhone3Comment] = useState(organization?.phone_admission_comment || '');
  const [email, setEmail] = useState(organization?.email || '');
  const [emailAdmission, setEmailAdmission] = useState(organization?.email_admission || '');
  const [website, setWebsite] = useState(organization?.website || '');
  const [telegram, setTelegram] = useState(organization?.telegram || '');

  // Адрес
  const [regionId, setRegionId] = useState<number | null>(organization?.region_id || null);
  const [districtId, setDistrictId] = useState<number | null>(organization?.district_id || null);
  const [address, setAddress] = useState(organization?.address || '');
  const [landmark, setLandmark] = useState(organization?.landmark || '');
  const [lat, setLat] = useState(organization?.lat || null);
  const [lng, setLng] = useState(organization?.lng || null);

  // Логотип
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url || null);
  const [logoKey, setLogoKey] = useState<string | null>(null);

  // Обложка
  const [coverImageUrl, setCoverImageUrl] = useState(organization?.cover_image_url || null);
  const [coverImageKey, setCoverImageKey] = useState<string | null>(null);

  // School Details
  const [schoolType, setSchoolType] = useState(schoolDetails?.school_type || 'private');
  const [gradeFrom, setGradeFrom] = useState(schoolDetails?.grade_from?.toString() || '1');
  const [gradeTo, setGradeTo] = useState(schoolDetails?.grade_to?.toString() || '11');
  const [acceptsPreparatory, setAcceptsPreparatory] = useState(schoolDetails?.accepts_preparatory || false);
  const [primaryLanguage, setPrimaryLanguage] = useState(schoolDetails?.primary_language || 'uzbek');
  const [feeMonthlyMin, setFeeMonthlyMin] = useState(schoolDetails?.fee_monthly_min?.toString() || '');
  const [feeMonthlyMax, setFeeMonthlyMax] = useState(schoolDetails?.fee_monthly_max?.toString() || '');

  const [districts, setDistricts] = useState(initialDistricts);

  // Загружаем районы при изменении региона
  useEffect(() => {
    if (regionId) {
      fetch(`/api/districts?region=${regionId}`)
        .then((res) => res.json())
        .then((data) => {
          // API возвращает массив напрямую
          const districtsList = Array.isArray(data) ? data : [];
          setDistricts(districtsList);
          // Сбрасываем район, если он не принадлежит новому региону
          if (districtId && !districtsList.some((d: any) => d.id === districtId)) {
            setDistrictId(null);
          }
        })
        .catch((err) => console.error('Error loading districts:', err));
    } else {
      setDistricts([]);
      setDistrictId(null);
    }
  }, [regionId, districtId]);

  // Формируем данные для автосохранения
  const formData = {
    name_uz: nameUz,
    description: description,
    phone: phone,
    email: email,
    region_id: regionId,
    district_id: districtId,
    address: address,
    lat: lat,
    lng: lng,
    school_type: schoolType,
    grade_from: parseInt(gradeFrom) || 1,
    grade_to: parseInt(gradeTo) || 11,
    primary_language: primaryLanguage,
    // Для fee_monthly_min/max используем null если поле пустое, иначе число (0 - валидное значение для бесплатных школ)
    fee_monthly_min: feeMonthlyMin === '' ? null : (parseFloat(feeMonthlyMin) || 0),
    fee_monthly_max: feeMonthlyMax === '' ? null : (parseFloat(feeMonthlyMax) || 0),
  };

  // Пересчитываем прогресс при изменении данных формы
  useEffect(() => {
    const calculatedProgress = calculateSectionProgress('basic', formData);
    setCurrentProgress(calculatedProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameUz, description, phone, email, regionId, districtId, address, lat, lng, schoolType, gradeFrom, gradeTo, primaryLanguage, feeMonthlyMin, feeMonthlyMax]);

  // Функция сохранения
  const saveData = async (data: any) => {
    const organizationData = {
      name_uz: data.name_uz || null,
      description: data.description || null,
      short_description: shortDescription || null,
      logo_url: logoUrl || null, // Добавляем логотип
      cover_image_url: coverImageUrl || null, // Добавляем обложку
      phone: data.phone || null,
      phone_secondary: phone2 || null,
      phone_secondary_comment: phone2Comment || null,
      phone_admission: phone3 || null,
      phone_admission_comment: phone3Comment || null,
      email: data.email || null,
      email_admission: emailAdmission || null,
      website: website || null,
      telegram: saveTelegram(telegram),
      region_id: data.region_id,
      district_id: data.district_id,
      address: data.address || null,
      landmark: landmark || null,
      lat: data.lat,
      lng: data.lng,
    };

    const schoolDetailsData = {
      school_type: data.school_type,
      grade_from: data.grade_from,
      grade_to: data.grade_to,
      accepts_preparatory: acceptsPreparatory,
      primary_language: data.primary_language,
      fee_monthly_min: data.fee_monthly_min || null,
      fee_monthly_max: data.fee_monthly_max || null,
    };

    const response = await fetch(`/api/admin/schools/${organization.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization: organizationData,
        school_details: schoolDetailsData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save');
    }

    // Обновляем прогресс
    const progress = calculateSectionProgress('basic', data);
    const progressResponse = await fetch(`/api/admin/schools/${organization.id}/sections/basic`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completeness: progress }),
    });
    if (progressResponse.ok) {
      setCurrentProgress(progress);
    }
  };

  const autosave = useAutosave({
    data: formData,
    onSave: async (data) => {
      try {
        await saveData(data);
        showToast({
          type: 'success',
          title: 'Данные сохранены',
          description: 'Изменения автоматически сохранены',
          duration: 3000,
        });
      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Ошибка сохранения',
          description: err.message || 'Не удалось сохранить данные',
          duration: 5000,
        });
        throw err;
      }
    },
    interval: 30000,
    debounceMs: 2000,
    enabled: true,
  });

  const handleManualSave = async () => {
    setLoading(true);
    setError(null);
    
    // Показываем уведомление о сохранении
    showToast({
      type: 'warning',
      title: 'Сохранение...',
      description: 'Пожалуйста, подождите',
      duration: 2000,
    });

    // Валидация
    const validation = validateBasicSection(formData);
    if (!validation.valid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errors[err.field] = err.message;
      });
      setValidationErrors(errors);
      setLoading(false);
      showToast({
        type: 'error',
        title: 'Ошибка валидации',
        description: 'Пожалуйста, исправьте ошибки в форме',
        duration: 5000,
      });
      return;
    }

    setValidationErrors({});

    try {
      await saveData(formData);
      router.refresh();
      showToast({
        type: 'success',
        title: 'Данные сохранены',
        description: 'Все изменения успешно сохранены',
        duration: 3000,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Xatolik yuz berdi';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Ошибка сохранения',
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header с прогрессом */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Базовая информация</CardTitle>
              <CardDescription>
                Заполнено: {currentProgress}%
              </CardDescription>
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

      {/* Ошибки */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Форма */}
      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Основная информация */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Основная информация</h2>
            
            {/* Загрузка логотипа */}
            <LogoUpload
              organizationId={organization.id}
              currentLogoUrl={logoUrl}
              onUploadSuccess={async (url, key) => {
                setLogoUrl(url);
                setLogoKey(key);
                try {
                  // Сохраняем сразу после загрузки
                  await saveData({ ...formData, logo_url: url });
                  showToast({
                    type: 'success',
                    title: 'Логотип загружен',
                    description: 'Логотип успешно сохранен',
                    duration: 3000,
                  });
                } catch (err: any) {
                  const errorMessage = err.message || 'Ошибка сохранения логотипа';
                  setError(errorMessage);
                  showToast({
                    type: 'error',
                    title: 'Ошибка сохранения',
                    description: errorMessage,
                    duration: 5000,
                  });
                }
              }}
              onRemove={async () => {
                setLogoUrl(null);
                setLogoKey(null);
                try {
                  // Сохраняем удаление
                  await saveData({ ...formData, logo_url: null });
                  showToast({
                    type: 'success',
                    title: 'Логотип удален',
                    description: 'Логотип успешно удален',
                    duration: 3000,
                  });
                } catch (err: any) {
                  const errorMessage = err.message || 'Ошибка удаления логотипа';
                  setError(errorMessage);
                  showToast({
                    type: 'error',
                    title: 'Ошибка удаления',
                    description: errorMessage,
                    duration: 5000,
                  });
                }
              }}
            />

            {/* Загрузка обложки */}
            <CoverImageUpload
              organizationId={organization.id}
              currentCoverUrl={coverImageUrl}
              onUploadSuccess={async (url, key) => {
                setCoverImageUrl(url);
                setCoverImageKey(key);
                try {
                  // Сохраняем сразу после загрузки
                  await saveData({ ...formData, cover_image_url: url });
                  showToast({
                    type: 'success',
                    title: 'Обложка загружена',
                    description: 'Обложка успешно сохранена',
                    duration: 3000,
                  });
                } catch (err: any) {
                  const errorMessage = err.message || 'Ошибка сохранения обложки';
                  setError(errorMessage);
                  showToast({
                    type: 'error',
                    title: 'Ошибка сохранения',
                    description: errorMessage,
                    duration: 5000,
                  });
                }
              }}
              onRemove={async () => {
                setCoverImageUrl(null);
                setCoverImageKey(null);
                try {
                  // Сохраняем удаление
                  await saveData({ ...formData, cover_image_url: null });
                  showToast({
                    type: 'success',
                    title: 'Обложка удалена',
                    description: 'Обложка успешно удалена',
                    duration: 3000,
                  });
                } catch (err: any) {
                  const errorMessage = err.message || 'Ошибка удаления обложки';
                  setError(errorMessage);
                  showToast({
                    type: 'error',
                    title: 'Ошибка удаления',
                    description: errorMessage,
                    duration: 5000,
                  });
                }
              }}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameUz">
                  Название (O'zbekcha) *
                  {validationErrors.name && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.name}</span>
                  )}
                </Label>
                <Input
                  id="nameUz"
                  value={nameUz}
                  onChange={(e) => setNameUz(e.target.value)}
                  placeholder="Maktab nomi"
                  className={validationErrors.name ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shortDescription">Краткое описание</Label>
                <Input
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Краткое описание (до 160 символов)"
                  maxLength={160}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">
                  Полное описание
                  {validationErrors.description && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.description}</span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Подробное описание школы"
                  rows={6}
                  className={validationErrors.description ? 'border-destructive' : ''}
                />
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Контакты</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Основной телефон */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Основной телефон (Колл центр) *
                  {validationErrors.phone && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.phone}</span>
                  )}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998901234567"
                  className={validationErrors.phone ? 'border-destructive' : ''}
                />
              </div>

              {/* Дополнительный телефон 1 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone2">Дополнительный телефон 1</Label>
                  <Input
                    id="phone2"
                    type="tel"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    placeholder="+998901234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone2Comment">Комментарий (например: Приёмная, Директор)</Label>
                  <Input
                    id="phone2Comment"
                    value={phone2Comment}
                    onChange={(e) => setPhone2Comment(e.target.value)}
                    placeholder="Приёмная, Директор и т.д."
                  />
                </div>
              </div>

              {/* Дополнительный телефон 2 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone3">Дополнительный телефон 2</Label>
                  <Input
                    id="phone3"
                    type="tel"
                    value={phone3}
                    onChange={(e) => setPhone3(e.target.value)}
                    placeholder="+998901234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone3Comment">Комментарий (например: Приёмная, Директор)</Label>
                  <Input
                    id="phone3Comment"
                    value={phone3Comment}
                    onChange={(e) => setPhone3Comment(e.target.value)}
                    placeholder="Приёмная, Директор и т.д."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                  {validationErrors.email && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.email}</span>
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@school.uz"
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAdmission">Email приёмной комиссии</Label>
                <Input
                  id="emailAdmission"
                  type="email"
                  value={emailAdmission}
                  onChange={(e) => setEmailAdmission(e.target.value)}
                  placeholder="admission@school.uz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Сайт</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://school.uz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@maktabsalam или https://t.me/maktabsalam или maktabsalam"
                />
                <p className="text-xs text-muted-foreground">
                  Принимается: @maktabsalam, https://t.me/maktabsalam, maktabsalam
                </p>
              </div>
            </div>
          </div>

          {/* Адрес */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Адрес</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">Область *</Label>
                <Select
                  value={regionId?.toString() || 'all'}
                  onValueChange={(value) => setRegionId(value === 'all' ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите область" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все области</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name_uz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Район *</Label>
                <Select
                  value={districtId?.toString() || ''}
                  onValueChange={(value) => setDistrictId(value ? parseInt(value) : null)}
                  disabled={!regionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите район" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id.toString()}>
                        {district.name_uz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Полный адрес *
                  {validationErrors.address && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.address}</span>
                  )}
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Адрес автоматически заполнится с карты или введите вручную"
                  className={validationErrors.address ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Адрес автоматически заполнится при выборе точки на карте
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="landmark">Ориентир</Label>
                <Input
                  id="landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Рядом с..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <YandexMap
                  lat={lat}
                  lng={lng}
                  onCoordinatesChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                  onAddressChange={(newAddress) => {
                    setAddress(newAddress);
                  }}
                  height="400px"
                />
              </div>
            </div>
          </div>

          {/* Основные параметры */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold">Основные параметры</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schoolType">Тип школы *</Label>
                <Select value={schoolType} onValueChange={setSchoolType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Частная</SelectItem>
                    <SelectItem value="state">Государственная</SelectItem>
                    <SelectItem value="international">Международная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryLanguage">Основной язык *</Label>
                <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uzbek">O'zbek</SelectItem>
                    <SelectItem value="russian">Русский</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeFrom">Классы (от) *</Label>
                <Select value={gradeFrom} onValueChange={setGradeFrom}>
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
                <Label htmlFor="gradeTo">Классы (до) *</Label>
                <Select value={gradeTo} onValueChange={setGradeTo}>
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
              <div className="space-y-2">
                <Label htmlFor="feeMin">
                  Стоимость (мин, сум) *
                  {validationErrors.fee_monthly_min && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.fee_monthly_min}</span>
                  )}
                </Label>
                <Input
                  id="feeMin"
                  type="number"
                  value={feeMonthlyMin}
                  onChange={(e) => setFeeMonthlyMin(e.target.value)}
                  placeholder="3000000"
                  className={validationErrors.fee_monthly_min ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeMax">
                  Стоимость (макс, сум) *
                  {validationErrors.fee_monthly_max && (
                    <span className="text-destructive text-sm ml-2">{validationErrors.fee_monthly_max}</span>
                  )}
                </Label>
                <Input
                  id="feeMax"
                  type="number"
                  value={feeMonthlyMax}
                  onChange={(e) => setFeeMonthlyMax(e.target.value)}
                  placeholder="5000000"
                  className={validationErrors.fee_monthly_max ? 'border-destructive' : ''}
                />
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

