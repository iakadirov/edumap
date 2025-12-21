'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressIndicator } from '../ProgressIndicator';
import { SaveStatusIndicator } from '../SaveStatusIndicator';
import { ErrorDisplay } from '../ErrorDisplay';
import { useToast } from '@/contexts/ToastContext';
import { useAutosave } from '@/lib/schools/autosave';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { validateBasicSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';
import { saveTelegram } from '@/lib/utils/telegram';
import { saveInstagram, saveFacebook, saveYouTube } from '@/lib/utils/social-media';
import { YandexMap } from '../YandexMap';
import { BrandSearch } from '@/components/admin/brands/BrandSearch';
import { Upload, X, Loader2, Image as ImageIcon, Phone, Mail, Globe, MessageCircle, Building2, GraduationCap, DollarSign, MapPin, School, BookOpen, Languages, FileText, BookMarked, Coins, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';
import { normalizePhone } from '@/lib/utils/phone';
import { normalizeWebsite } from '@/lib/utils/website';

interface BasicInfoFormProps {
  organization: any;
  schoolDetails: any;
  regions: any[];
  districts: any[];
  currentProgress: number;
}

interface PhoneWithComment {
  phone: string;
  comment: string;
}

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  type: 'logo' | 'cover';
  previewSize: string;
}

function ImageUploadField({
  label,
  value,
  onChange,
  type,
  previewSize,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обновляем preview при изменении value
  useEffect(() => {
    const loadImageUrl = async () => {
      if (!value) {
        setPreview(null);
        setError(null);
        return;
      }

      // Если это полный URL (начинается с http), используем его напрямую
      if (value.startsWith('http://') || value.startsWith('https://')) {
        // Это может быть presigned URL или обычный публичный URL
        // Используем как есть - если presigned URL истек, onError обработает это
        setPreview(value);
        return;
      }

      // Если это относительный путь (начинается с /), добавляем базовый URL
      if (value.startsWith('/')) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        setPreview(`${baseUrl}${value}`);
        return;
      }

      // Это ключ файла в storage (например, "logos/123/logo.png")
      // Получаем актуальный presigned URL
      try {
        setError(null);
        const response = await fetch(`/api/storage/url?key=${encodeURIComponent(value)}&expires=3600`);
        if (response.ok) {
          const data = await response.json();
          setPreview(data.url);
        } else {
          const errorText = await response.text();
          console.error('Failed to get presigned URL:', errorText);
          // Если не удалось получить URL, не показываем ошибку валидации
          // Просто логируем и оставляем preview пустым
          // Это не критичная ошибка для валидации формы
          setPreview(null);
        }
      } catch (err) {
        console.error('Error loading image URL:', err);
        // Не устанавливаем ошибку валидации - это не блокирует работу формы
        setPreview(null);
      }
    };

    loadImageUrl();
  }, [value]);

  const ALLOWED_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
    'image/gif',
  ];

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidMimeType = ALLOWED_TYPES.includes(file.type);
    const isSvgFile = fileExtension === 'svg' && file.type.startsWith('image/');
    const isValidType = isValidMimeType || isSvgFile;

    if (!isValidType) {
      setError('Faqat rasm fayllari: PNG, JPG, JPEG, SVG, WebP, GIF');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`Fayl juda katta. Maksimal: ${MAX_SIZE / 1024 / 1024}MB`);
      return;
    }

    // Показываем preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fayl yuklashda xatolik');
      }

      const data = await response.json();
      // Сохраняем key вместо presigned URL, чтобы URL не истекал
      // Presigned URL будет получаться динамически при загрузке страницы
      const fileKey = data.key; // Используем key из ответа API
      if (fileKey) {
        // Для немедленного отображения получаем presigned URL
        const urlResponse = await fetch(`/api/storage/url?key=${encodeURIComponent(fileKey)}&expires=3600`);
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          setPreview(urlData.url);
        } else {
          // Fallback на presigned URL из ответа загрузки
          setPreview(data.url);
        }
        onChange(fileKey); // Сохраняем key в БД
      } else {
        // Если key нет, используем старый подход (для обратной совместимости)
        setPreview(data.url);
        onChange(data.url);
      }
    } catch (err: any) {
      setError(err.message || 'Fayl yuklanmadi');
      setPreview(value || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className={cn('border-2 border-dashed rounded-lg p-4 flex items-center justify-center overflow-hidden', previewSize)}>
        {preview ? (
          <div className={cn('relative', type === 'logo' ? 'w-32 h-32' : 'w-full h-32')}>
            <img
              src={preview}
              alt={label}
              className={cn(
                'w-full h-full rounded',
                type === 'logo' ? 'rounded-full object-contain' : 'rounded-lg object-cover'
              )}
              onError={async (e) => {
                try {
                  // onError получает событие, а не объект ошибки
                  const target = e.target as HTMLImageElement;
                  const failedSrc = target?.src || preview;
                  
                  // Логируем только для отладки, не показываем пользователю
                  console.warn('Image load error:', {
                    src: failedSrc,
                    value: value,
                  });
                  
                  // Если это presigned URL и он истек, пытаемся получить новый по ключу
                  if (preview?.startsWith('http') && preview.includes('X-Amz-') && value && !value.startsWith('http')) {
                    // value - это ключ файла, получаем новый presigned URL
                    try {
                      const response = await fetch(`/api/storage/url?key=${encodeURIComponent(value)}&expires=3600`);
                      if (response.ok) {
                        const data = await response.json();
                        setPreview(data.url);
                        setError(null);
                        return; // Успешно обновили URL
                      }
                    } catch (err) {
                      console.error('Error refreshing presigned URL:', err);
                    }
                  }
                  
                  // Не устанавливаем ошибку валидации - это не критично для работы формы
                  // Просто скрываем изображение, если оно не загрузилось
                  // Пользователь может загрузить новое изображение
                } catch (err) {
                  // Игнорируем ошибки в обработчике ошибок
                  console.error('Error in onError handler:', err);
                }
              }}
              onLoad={() => {
                // Очищаем ошибку при успешной загрузке
                setError(null);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Rasm yuklash
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
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
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Основная информация
  const [nameUz, setNameUz] = useState(organization?.name_uz || '');
  const [slug, setSlug] = useState(organization?.slug || '');
  const [description, setDescription] = useState(organization?.description || '');

  // Генерация slug из названия
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
      .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
      .replace(/-+/g, '-') // Убираем множественные дефисы
      .replace(/^-|-$/g, ''); // Убираем дефисы в начале и конце
  };

  // Автогенерация slug при изменении названия
  useEffect(() => {
    if (nameUz && (!slug || slug === generateSlug(organization?.name_uz || ''))) {
      setSlug(generateSlug(nameUz));
    }
  }, [nameUz, organization?.name_uz]);
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url || null);
  const [bannerUrl, setBannerUrl] = useState(organization?.banner_url || organization?.cover_image_url || null);
  const [schoolType, setSchoolType] = useState(schoolDetails?.school_type || 'private');

  // Контакты
  const [phone, setPhone] = useState(organization?.phone || '');
  const [phone2, setPhone2] = useState<PhoneWithComment>({
    phone: organization?.phone_secondary || '',
    comment: organization?.phone_secondary_comment || '',
  });
  const [phone3, setPhone3] = useState<PhoneWithComment>({
    phone: organization?.phone_admission || '',
    comment: organization?.phone_admission_comment || '',
  });
  const [email, setEmail] = useState(organization?.email || '');
  const [website, setWebsite] = useState(organization?.website || '');
  const [telegram, setTelegram] = useState(organization?.telegram || '');
  const [instagram, setInstagram] = useState(organization?.instagram || '');
  const [facebook, setFacebook] = useState(organization?.facebook || '');
  const [youtube, setYoutube] = useState(organization?.youtube || '');

  // Адрес
  const [regionId, setRegionId] = useState<number | null>(organization?.region_id || null);
  const [districtId, setDistrictId] = useState<number | null>(organization?.district_id || null);
  const [address, setAddress] = useState(organization?.address || '');
  const [landmark, setLandmark] = useState(organization?.landmark || '');
  const [lat, setLat] = useState(organization?.lat || null);
  const [lng, setLng] = useState(organization?.lng || null);

  // Образование
  const [acceptedGrades, setAcceptedGrades] = useState<number[]>(
    schoolDetails?.accepted_grades || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  );
  const [primaryLanguages, setPrimaryLanguages] = useState<string[]>(
    schoolDetails?.primary_language
      ? [schoolDetails.primary_language, ...(schoolDetails?.additional_languages || [])].filter(Boolean)
      : ['uzbek']
  );
  const [curriculum, setCurriculum] = useState<string[]>(
    schoolDetails?.curriculum || ['national']
  );
  const [pricingTiers, setPricingTiers] = useState<Array<{ grades: number[]; price: number | null }>>(
    schoolDetails?.pricing_tiers || []
  );
  const [brandId, setBrandId] = useState<string | null>(organization?.brand_id || null);

  const [districts, setDistricts] = useState(initialDistricts);

  // Автозаполнение данных из бренда при выборе бренда
  useEffect(() => {
    if (brandId) {
      fetch(`/api/admin/brands/${brandId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.brand) {
            const brand = data.brand;
            // Заполняем только пустые поля, чтобы не перезаписывать уже введенные данные
            if (!nameUz && brand.name) {
              setNameUz(brand.name);
            }
            if (!logoUrl && brand.logo_url) {
              setLogoUrl(brand.logo_url);
            }
            if (!bannerUrl && (brand.banner_url || brand.cover_image_url)) {
              setBannerUrl(brand.banner_url || brand.cover_image_url);
            }
            if (!phone && brand.phone) {
              setPhone(brand.phone);
            }
            if (!website && brand.website) {
              setWebsite(brand.website);
            }
            if (!instagram && brand.instagram) {
              setInstagram(brand.instagram);
            }
            if (!facebook && brand.facebook) {
              setFacebook(brand.facebook);
            }
            if (!youtube && brand.youtube) {
              setYoutube(brand.youtube);
            }
            if (!telegram && brand.telegram) {
              setTelegram(brand.telegram);
            }
            if (!description && brand.description) {
              setDescription(brand.description);
            }
          }
        })
        .catch((err) => console.error('Error loading brand data:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  // Загружаем районы при изменении региона
  useEffect(() => {
    if (regionId) {
      setLoadingDistricts(true);
      fetch(`/api/districts?region=${regionId}`)
        .then((res) => res.json())
        .then((data) => {
          const districtsList = Array.isArray(data) ? data : [];
          setDistricts(districtsList);
          if (districtId && !districtsList.some((d: any) => d.id === districtId)) {
            setDistrictId(null);
          }
        })
        .catch((err) => console.error('Error loading districts:', err))
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
      if (districtId) {
        setDistrictId(null);
      }
    }
  }, [regionId, districtId]);

  // Формируем данные для автосохранения
  const formData = {
      name_uz: nameUz,
      slug: slug || generateSlug(nameUz),
      description: description,
    phone: phone,
    email: email,
    region_id: regionId,
    district_id: districtId,
    address: address,
    lat: lat,
    lng: lng,
    school_type: schoolType,
    accepted_grades: acceptedGrades,
    primary_languages: primaryLanguages,
    curriculum: curriculum,
    pricing_tiers: pricingTiers,
  };

  // Пересчитываем прогресс при изменении данных формы
  useEffect(() => {
    const calculatedProgress = calculateSectionProgress('basic', formData);
    setCurrentProgress(calculatedProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameUz, description, phone, email, regionId, districtId, address, lat, lng, schoolType, acceptedGrades, primaryLanguages, curriculum, pricingTiers]);

  // Валидация в реальном времени
  useEffect(() => {
    const validation = validateBasicSection(formData);
    const errors: Record<string, string> = {};
    validation.errors.forEach((err) => {
      errors[err.field] = err.message;
    });
    setValidationErrors(errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameUz, phone, email, address, lat, lng, schoolType, acceptedGrades, primaryLanguages, curriculum, pricingTiers]);

  // Функция сохранения
  const saveData = async (data: any) => {
    // Нормализуем социальные сети
    const normalizedTelegram = saveTelegram(telegram);
    const normalizedInstagram = saveInstagram(instagram);
    const normalizedFacebook = saveFacebook(facebook);
    const normalizedYouTube = saveYouTube(youtube);

    const organizationData = {
      name_uz: data.name_uz || null,
      slug: data.slug || generateSlug(data.name_uz || ''),
      description: data.description || null,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      cover_image_url: bannerUrl || null, // Для обратной совместимости (используем bannerUrl)
      phone: normalizePhone(data.phone) || null,
      phone_secondary: normalizePhone(phone2.phone) || null,
      phone_secondary_comment: phone2.comment || null,
      phone_admission: normalizePhone(phone3.phone) || null,
      phone_admission_comment: phone3.comment || null,
      email: data.email || null,
      website: normalizeWebsite(website) || null,
      telegram: normalizedTelegram,
      instagram: normalizedInstagram,
      facebook: normalizedFacebook,
      youtube: normalizedYouTube,
      region_id: data.region_id,
      district_id: data.district_id,
      address: data.address || null,
      landmark: landmark || null,
      lat: data.lat,
      lng: data.lng,
      brand_id: brandId || null,
    };

    // Вычисляем grade_from и grade_to из accepted_grades для обратной совместимости
    const sortedGrades = [...data.accepted_grades].sort((a, b) => a - b);
    const gradeFrom = sortedGrades[0] === 0 ? 1 : sortedGrades[0];
    const gradeTo = sortedGrades[sortedGrades.length - 1];
    const acceptsPreparatory = data.accepted_grades.includes(0);

    // Вычисляем min/max цены из тарифов для обратной совместимости
    const prices = data.pricing_tiers
      .map((tier: { grades: number[]; price: number | null }) => tier.price)
      .filter((price: number | null): price is number => price !== null && price > 0);
    const feeMonthlyMin = prices.length > 0 ? Math.min(...prices) : null;
    const feeMonthlyMax = prices.length > 0 ? Math.max(...prices) : null;

    // Первый язык - основной, остальные - дополнительные
    const primaryLanguage = data.primary_languages.length > 0 ? data.primary_languages[0] : 'uzbek';
    const additionalLanguages = data.primary_languages.length > 1 
      ? data.primary_languages.slice(1) 
      : null;

    const schoolDetailsData = {
      school_type: data.school_type,
      grade_from: gradeFrom,
      grade_to: gradeTo,
      accepts_preparatory: acceptsPreparatory,
      accepted_grades: data.accepted_grades,
      primary_language: primaryLanguage,
      additional_languages: additionalLanguages,
      curriculum: data.curriculum.length > 0 ? data.curriculum : null,
      fee_monthly_min: feeMonthlyMin,
      fee_monthly_max: feeMonthlyMax,
      pricing_tiers: data.pricing_tiers.length > 0 ? data.pricing_tiers : null,
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

  // Предупреждение о несохраненных изменениях
  useUnsavedChanges(autosave.hasUnsavedChanges, 'Sizda saqlanmagan o\'zgarishlar bor. Sahifani tark etishni xohlaysizmi?');

  const handleManualSave = async () => {
    setLoading(true);
    setError(null);
    
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
              <SaveStatusIndicator
                status={autosave.status}
                lastSaved={autosave.lastSaved}
                error={autosave.error}
                className="mb-2"
              />
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

      {/* Ошибки валидации */}
      {Object.keys(validationErrors).length > 0 && (
        <ErrorDisplay
          errors={Object.entries(validationErrors).map(([field, message]) => ({
            field,
            message,
          }))}
          onDismiss={() => setValidationErrors({})}
          scrollToFirst={false}
        />
      )}

      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            1. Asosiy ma'lumotlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Brand Search - перемещено в начало */}
          <div className="pb-4 border-b">
            <BrandSearch
              value={brandId}
              onChange={setBrandId}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name_uz" className="flex items-center gap-2">
                <School className="w-4 h-4" />
                Maktab nomi (O'zbekcha) *
              </Label>
              <Input
                id="name_uz"
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
                placeholder="Cambridge School Tashkent"
                className={validationErrors.name ? 'border-destructive' : ''}
              />
              {validationErrors.name && (
                <span className="text-destructive text-sm">{validationErrors.name}</span>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="slug" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Slug (URL nikneyim)
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="cambridge-school-tashkent"
              />
              <p className="text-sm text-muted-foreground">
                URL: edumap.uz/schools/{slug || 'slug'}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school_type" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Maktab turi *
              </Label>
              <Select
                value={schoolType}
                onValueChange={setSchoolType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Xususiy</SelectItem>
                  <SelectItem value="international">Xalqaro</SelectItem>
                  <SelectItem value="state">Davlat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Qisqa tavsif
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Xalqaro maktab Cambridge dasturi bilan..."
                rows={4}
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">
                {description.length}/200 belgi
              </p>
            </div>
            
            {/* Logo and Banner Upload */}
            <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
              <ImageUploadField
                label="Logotip"
                value={logoUrl || undefined}
                onChange={(url) => setLogoUrl(url || null)}
                type="logo"
                previewSize="w-32 h-32"
              />
              
              <ImageUploadField
                label="Banner"
                value={bannerUrl || undefined}
                onChange={(url) => setBannerUrl(url || null)}
                type="cover"
                previewSize="w-full h-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Contacts and Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            2. Kontaktlar va manzil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Основной телефон */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Asosiy telefon (Koll markaz) *
              </Label>
              <PhoneInput
                id="phone"
                value={phone}
                onChange={(value) => setPhone(value)}
                className={validationErrors.phone ? 'border-destructive' : ''}
              />
              {validationErrors.phone && (
                <span className="text-destructive text-sm">{validationErrors.phone}</span>
              )}
            </div>

            {/* Дополнительный телефон 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone2" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Qo'shimcha telefon 1
                </Label>
                <PhoneInput
                  id="phone2"
                  value={phone2.phone}
                  onChange={(value) => setPhone2({ ...phone2, phone: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2_comment">Izoh (masalan: Qabul, Direktor)</Label>
                <Input
                  id="phone2_comment"
                  value={phone2.comment}
                  onChange={(e) => setPhone2({ ...phone2, comment: e.target.value })}
                  placeholder="Qabul, Direktor, va hokazo"
                />
              </div>
            </div>

            {/* Дополнительный телефон 2 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone3" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Qo'shimcha telefon 2
                </Label>
                <PhoneInput
                  id="phone3"
                  value={phone3.phone}
                  onChange={(value) => setPhone3({ ...phone3, phone: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone3_comment">Izoh (masalan: Qabul, Direktor)</Label>
                <Input
                  id="phone3_comment"
                  value={phone3.comment}
                  onChange={(e) => setPhone3({ ...phone3, comment: e.target.value })}
                  placeholder="Qabul, Direktor, va hokazo"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@school.uz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Veb-sayt
              </Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="telegram" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Telegram
              </Label>
              <Input
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@maktabsalam yoki https://t.me/maktabsalam yoki maktabsalam"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                Instagram
              </Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username yoki https://instagram.com/username"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                Facebook
              </Label>
              <Input
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="username yoki https://facebook.com/username"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
                YouTube
              </Label>
              <Input
                id="youtube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="@channel yoki https://youtube.com/@channel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Viloyat *
              </Label>
              <Select
                value={regionId?.toString() || 'all'}
                onValueChange={(value) =>
                  setRegionId(value === 'all' ? null : parseInt(value))
                }
                disabled={loadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingDistricts ? "Yuklanmoqda..." : "Viloyatni tanlang"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha viloyatlar</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.name_uz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Tuman *
              </Label>
              <Select
                value={districtId?.toString() || ''}
                onValueChange={(value) =>
                  setDistrictId(value ? parseInt(value) : null)
                }
                disabled={!regionId || loadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !regionId 
                      ? "Avval viloyatni tanlang" 
                      : loadingDistricts 
                      ? "Yuklanmoqda..." 
                      : "Tumanni tanlang"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id.toString()}>
                      {district.name_uz || district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Manzil *
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Manzil avtomatik to'ldiriladi yoki qo'lda kiriting"
                className={validationErrors.address ? 'border-destructive' : ''}
              />
              {validationErrors.address && (
                <span className="text-destructive text-sm">{validationErrors.address}</span>
              )}
              <p className="text-xs text-muted-foreground">
                Manzil kartadan avtomatik to'ldiriladi yoki qo'lda kiriting
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="landmark">Yo'naltiruvchi</Label>
              <Input
                id="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Yaqinida..."
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
        </CardContent>
      </Card>

      {/* Section 3: Education and Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5" />
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
                  const isSelected = acceptedGrades.includes(grade);
                  return (
                    <Button
                      key={grade}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setAcceptedGrades(acceptedGrades.filter((g) => g !== grade));
                        } else {
                          setAcceptedGrades([...acceptedGrades, grade].sort((a, b) => a - b));
                        }
                      }}
                      className={cn(
                        "min-w-[50px]",
                        isSelected && "bg-primary text-primary-foreground"
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
                  const isSelected = primaryLanguages.includes(lang);
                  const label = lang === 'uzbek'
                    ? 'O\'zbek'
                    : lang === 'russian'
                      ? 'Rus'
                      : 'Ingliz';
                  return (
                    <Button
                      key={lang}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setPrimaryLanguages(primaryLanguages.filter((l) => l !== lang));
                        } else {
                          setPrimaryLanguages([...primaryLanguages, lang]);
                        }
                      }}
                      className={cn(
                        "min-w-[100px]",
                        isSelected && "bg-primary text-primary-foreground"
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
                {[
                  { value: 'national', label: 'Milliy' },
                  { value: 'cambridge', label: 'Cambridge' },
                  { value: 'ib', label: 'IB' },
                ].map((prog) => {
                  const isSelected = curriculum.includes(prog.value);
                  return (
                    <Button
                      key={prog.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          setCurriculum(curriculum.filter((c) => c !== prog.value));
                        } else {
                          setCurriculum([...curriculum, prog.value]);
                        }
                      }}
                      className={cn(
                        "min-w-[120px]",
                        isSelected && "bg-primary text-primary-foreground"
                      )}
                    >
                      {prog.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Narxlar (so'm)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPricingTiers([
                      ...pricingTiers,
                      { grades: [], price: null },
                    ]);
                  }}
                >
                  + Prays qo'shish
                </Button>
              </div>
              <div className="space-y-3">
                {pricingTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Sinflar
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {acceptedGrades.map((grade) => (
                          <div key={grade} className="flex items-center space-x-1">
                            <Checkbox
                              id={`tier-${index}-grade-${grade}`}
                              checked={tier.grades.includes(grade)}
                              onCheckedChange={(checked) => {
                                const newTiers = [...pricingTiers];
                                if (checked) {
                                  newTiers[index].grades = [
                                    ...tier.grades,
                                    grade,
                                  ].sort((a, b) => a - b);
                                } else {
                                  newTiers[index].grades = tier.grades.filter(
                                    (g) => g !== grade
                                  );
                                }
                                setPricingTiers(newTiers);
                              }}
                            />
                            <Label
                              htmlFor={`tier-${index}-grade-${grade}`}
                              className="cursor-pointer text-xs"
                            >
                              {grade === 0 ? '0' : grade}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Narx (so'm)
                      </Label>
                      <Input
                        type="number"
                        value={tier.price || ''}
                        onChange={(e) => {
                          const newTiers = [...pricingTiers];
                          newTiers[index].price = e.target.value
                            ? parseFloat(e.target.value)
                            : null;
                          setPricingTiers(newTiers);
                        }}
                        placeholder="3000000"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPricingTiers(pricingTiers.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {pricingTiers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Hozircha narxlar qo'shilmagan
                  </p>
                )}
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
