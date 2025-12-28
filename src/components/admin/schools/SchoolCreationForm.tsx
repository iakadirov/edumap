'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { saveTelegram } from '@/lib/utils/telegram';
import { saveInstagram, saveFacebook, saveYouTube } from '@/lib/utils/social-media';
import { normalizePhone } from '@/lib/utils/phone';
import { normalizeWebsite } from '@/lib/utils/website';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { BasicInfoSection } from './forms/BasicInfoSection';
import { ContactsSection } from './forms/ContactsSection';
import { EducationSection } from './forms/EducationSection';
import { ImageUploadField } from './forms/ImageUploadField';

interface PhoneWithComment {
  phone: string;
  comment: string;
}

interface WizardData {
  // Step 1: Basic
  name_uz: string;
  school_type: string;
  description: string;
  logo_url?: string;
  banner_url?: string;

  // Step 2: Contacts
  phone: string; // Основной телефон (колл центр)
  phone2?: PhoneWithComment; // Дополнительный телефон 1
  phone3?: PhoneWithComment; // Дополнительный телефон 2
  email: string;
  website: string;
  telegram: string;
  instagram: string;
  facebook: string;
  youtube: string;
  region_id: number | null;
  district_id: number | null;
  address: string;
  landmark: string;
  lat?: number;
  lng?: number;

  // Step 3: Education
  accepted_grades: number[]; // Классы приёма (0-11)
  primary_languages: string[]; // Языки обучения (мультивыбор)
  curriculum: string[];
  pricing_tiers: Array<{ grades: number[]; price: number | null }>; // Тарифы по классам
}

export function SchoolCreationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Array<{ id: number; name: string; name_uz?: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: number; name: string; name_uz?: string; region_id: number }>>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingDuplicate, setLoadingDuplicate] = useState(false);

  const [brandId, setBrandId] = useState<string | null>(null);

  // Автозаполнение данных из бренда при выборе бренда
  useEffect(() => {
    if (brandId) {
      fetch(`/api/admin/brands/${brandId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.brand) {
            const brand = data.brand;
            // Заполняем только пустые поля, чтобы не перезаписывать уже введенные данные
            const brandBannerUrl = brand.banner_url || brand.cover_image_url;
            setData((prev) => ({
              ...prev,
              name_uz: prev.name_uz || brand.name || '',
              description: prev.description || brand.description || '',
              logo_url: prev.logo_url || brand.logo_url || undefined,
              banner_url: prev.banner_url || brandBannerUrl || undefined,
              phone: prev.phone || brand.phone || '',
              website: prev.website || brand.website || '',
              instagram: prev.instagram || brand.instagram || '',
              facebook: prev.facebook || brand.facebook || '',
              youtube: prev.youtube || brand.youtube || '',
              telegram: prev.telegram || brand.telegram || '',
            }));
          }
        })
        .catch((err) => console.error('Error loading brand data:', err));
    }
     
  }, [brandId]);

  const [data, setData] = useState<WizardData>({
    name_uz: '',
    school_type: 'private',
    description: '',
    logo_url: undefined,
    banner_url: undefined,
    phone: '',
    email: '',
    website: '',
    telegram: '',
    instagram: '',
    facebook: '',
    youtube: '',
    region_id: null,
    district_id: null,
    address: '',
    landmark: '',
    accepted_grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // По умолчанию 1-11 классы
    primary_languages: ['uzbek'], // По умолчанию узбекский
    curriculum: ['national'], // По умолчанию Milliy
    pricing_tiers: [], // Тарифы
  });

  // Загружаем регионы при монтировании
  useEffect(() => {
    async function loadRegions() {
      setLoadingRegions(true);
      try {
        const response = await fetch('/data/regions.json');
        const data = await response.json();
        setRegions(data);
      } catch (error) {
        console.error('Error loading regions:', error);
      } finally {
        setLoadingRegions(false);
      }
    }
    loadRegions();
  }, []);

  // Загружаем районы при изменении региона
  useEffect(() => {
    if (data.region_id) {
      setLoadingDistricts(true);
      fetch(`/api/districts?region=${data.region_id}`)
        .then((res) => res.json())
        .then((responseData) => {
          const districtsList = Array.isArray(responseData) ? responseData : [];
          setDistricts(districtsList);
          // Сбрасываем район, если он не принадлежит новому региону
          if (data.district_id && !districtsList.some((d) => d.id === data.district_id)) {
            updateData('district_id', null);
          }
        })
        .catch((err) => {
          console.error('Error loading districts:', err);
          setDistricts([]);
        })
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
      if (data.district_id) {
        updateData('district_id', null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.region_id]);

  // Загружаем данные для дублирования
  useEffect(() => {
    const duplicateId = searchParams.get('duplicate');
    if (duplicateId) {
      loadDuplicateData(duplicateId);
    }
     
  }, [searchParams]);

  const loadDuplicateData = async (schoolId: string) => {
    setLoadingDuplicate(true);
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/duplicate`);
      if (!response.ok) {
        throw new Error('Failed to load school data');
      }
      const { organization, school_details } = await response.json();

      // Генерируем базовый slug из названия
      const baseSlug = generateSlug(organization.name_uz || organization.name || 'school');
      
      // Получаем список существующих slugs для генерации уникального
      try {
        const slugsResponse = await fetch('/api/admin/schools/slugs');
        if (slugsResponse.ok) {
          const slugsData = await slugsResponse.json();
          const existingSlugs = slugsData.slugs || [];
          // Генерируем уникальный slug с суффиксом
          const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
          // Сохраняем slug в состоянии (можно использовать для отображения, но он будет перегенерирован при сохранении)
        }
      } catch (err) {
        console.error('Error fetching slugs:', err);
        // Продолжаем без проверки уникальности, slug будет проверен при сохранении
      }

      // Предзаполняем данные организации
      setData((prev) => ({
        ...prev,
        name_uz: organization.name_uz || organization.name || '',
        description: organization.description || '',
        logo_url: organization.logo_url || undefined,
        banner_url: organization.cover_image_url || organization.banner_url || undefined,
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        telegram: organization.telegram || '',
        instagram: organization.instagram || '',
        facebook: organization.facebook || '',
        youtube: organization.youtube || '',
        region_id: organization.region_id || null,
        district_id: organization.district_id || null,
        address: organization.address || '',
        landmark: organization.landmark || '',
        lat: organization.lat || undefined,
        lng: organization.lng || undefined,
        phone2: organization.phone_secondary 
          ? { phone: organization.phone_secondary, comment: organization.phone_secondary_comment || '' }
          : undefined,
        phone3: organization.phone_admission
          ? { phone: organization.phone_admission, comment: organization.phone_admission_comment || '' }
          : undefined,
      }));

      // Предзаполняем данные school_details
      if (school_details) {
        setData((prev) => ({
          ...prev,
          school_type: school_details.school_type || 'private',
          accepted_grades: school_details.accepted_grades || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          primary_languages: school_details.primary_language 
            ? [school_details.primary_language, ...(school_details.additional_languages || [])]
            : ['uzbek'],
          curriculum: school_details.curriculum || ['national'],
          pricing_tiers: school_details.pricing_tiers || [],
        }));
      }

      // Устанавливаем brand_id если есть
      if (organization.brand_id) {
        setBrandId(organization.brand_id);
      }

      // Загружаем районы если выбран регион
      if (organization.region_id) {
        fetch(`/api/districts?region=${organization.region_id}`)
          .then((res) => res.json())
          .then((districtsList) => {
            setDistricts(Array.isArray(districtsList) ? districtsList : []);
          })
          .catch((err) => console.error('Error loading districts:', err));
      }
    } catch (err) {
      console.error('Error loading duplicate data:', err);
      setError('Maktab ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoadingDuplicate(false);
    }
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!data.name_uz) {
      setError('Maktab nomi kiritilishi kerak');
      return false;
    }
    if (!data.phone) {
      setError('Asosiy telefon raqami (kolll markaz) kiritilishi kerak');
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
    // Валидация цен не обязательна - цены опциональны (можно добавить тарифы позже)

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Генерируем slug и проверяем уникальность
      const baseSlug = generateSlug(data.name_uz || 'school');
      
      // Получаем список существующих slugs для проверки уникальности
      let uniqueSlug = baseSlug;
      try {
        const slugsResponse = await fetch('/api/admin/schools/slugs');
        if (slugsResponse.ok) {
          const slugsData = await slugsResponse.json();
          const existingSlugs = slugsData.slugs || [];
          uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);
        }
      } catch (err) {
        console.error('Error fetching slugs:', err);
        // Используем базовый slug, проверка будет на сервере
      }
      
      const slug = uniqueSlug;

      // Нормализуем социальные сети
      const normalizedTelegram = saveTelegram(data.telegram);
      const normalizedInstagram = saveInstagram(data.instagram);
      const normalizedFacebook = saveFacebook(data.facebook);
      const normalizedYouTube = saveYouTube(data.youtube);

      const organizationData = {
        org_type: 'school',
        name: data.name_uz || 'School',
        name_uz: data.name_uz || null,
        slug,
        description: data.description || null,
        status: 'published',
        phone: normalizePhone(data.phone) || null,
        phone_secondary: normalizePhone(data.phone2?.phone) || null,
        phone_secondary_comment: data.phone2?.comment || null,
        phone_admission: normalizePhone(data.phone3?.phone) || null,
        phone_admission_comment: data.phone3?.comment || null,
        email: data.email || null,
        website: normalizeWebsite(data.website) || null,
        telegram: normalizedTelegram,
        instagram: normalizedInstagram,
        facebook: normalizedFacebook,
        youtube: normalizedYouTube,
        region_id: data.region_id,
        district_id: data.district_id,
        address: data.address,
        landmark: data.landmark || null,
        lat: data.lat || null,
        lng: data.lng || null,
        logo_url: data.logo_url || null,
        banner_url: data.banner_url || null,
        cover_image_url: data.banner_url || null, // Для обратной совместимости (используем banner_url)
        brand_id: brandId || null,
      };

      // Вычисляем grade_from и grade_to из accepted_grades
      const sortedGrades = [...data.accepted_grades].sort((a, b) => a - b);
      const gradeFrom = sortedGrades[0] === 0 ? 1 : sortedGrades[0];
      const gradeTo = sortedGrades[sortedGrades.length - 1];
      const acceptsPreparatory = data.accepted_grades.includes(0);

      // Вычисляем min/max цены из тарифов для обратной совместимости с БД
      const prices = data.pricing_tiers
        .map((tier) => tier.price)
        .filter((price): price is number => price !== null && price > 0);
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
        accepted_grades: data.accepted_grades, // Сохраняем выбранные классы
        primary_language: primaryLanguage, // Первый выбранный язык - основной
        additional_languages: additionalLanguages, // Остальные языки - дополнительные
        curriculum: data.curriculum.length > 0 ? data.curriculum : null,
        fee_monthly_min: feeMonthlyMin,
        fee_monthly_max: feeMonthlyMax,
        // Сохраняем тарифы в JSONB поле (Supabase автоматически конвертирует массив в JSONB)
        pricing_tiers: data.pricing_tiers.length > 0 ? data.pricing_tiers : null,
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
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Предупреждение о несохраненных изменениях при создании школы
  const hasUnsavedChanges = Object.values(data).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => v !== null && v !== '');
    }
    return value !== '' && value !== null && value !== undefined;
  });
  useUnsavedChanges(hasUnsavedChanges && !loading, 'Sizda saqlanmagan o\'zgarishlar bor. Sahifani tark etishni xohlaysizmi?');

  const updateData = <K extends keyof WizardData>(
    key: K,
    value: WizardData[K]
  ) => {
    setData((prev) => {
      if (key === 'phone2' || key === 'phone3') {
        // Для дополнительных телефонов, если телефон пустой, удаляем объект
        const phoneData = value as PhoneWithComment | undefined;
        if (!phoneData?.phone && !phoneData?.comment) {
          return { ...prev, [key]: undefined };
        }
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-[24px] bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Section 1: Basic Information */}
      <BasicInfoSection
        data={{
          name_uz: data.name_uz,
          school_type: data.school_type,
          description: data.description,
          logo_url: data.logo_url,
          banner_url: data.banner_url,
        }}
        brandId={brandId}
        onDataChange={(key, value) => {
          updateData(key as keyof WizardData, value as any);
        }}
        onBrandChange={setBrandId}
        ImageUploadField={ImageUploadField}
      />

      {/* Section 2: Contacts and Address */}
      <ContactsSection
        data={{
          phone: data.phone,
          phone2: data.phone2,
          phone3: data.phone3,
          email: data.email,
          website: data.website,
          telegram: data.telegram,
          instagram: data.instagram,
          facebook: data.facebook,
          youtube: data.youtube,
          region_id: data.region_id,
          district_id: data.district_id,
          address: data.address,
          landmark: data.landmark,
          lat: data.lat,
          lng: data.lng,
        }}
        regions={regions}
        districts={districts}
        loadingDistricts={loadingDistricts}
        onDataChange={(key, value) => {
          updateData(key as keyof WizardData, value as any);
        }}
        onRegionChange={(regionId) => {
          updateData('region_id', regionId);
          // Загружаем районы при изменении региона
          if (regionId) {
            setLoadingDistricts(true);
            fetch(`/api/districts?region=${regionId}`)
              .then((res) => res.json())
              .then((districtsData) => {
                const districtsList = Array.isArray(districtsData) ? districtsData : [];
                setDistricts(districtsList);
                if (data.district_id && !districtsList.some((d) => d.id === data.district_id)) {
                  updateData('district_id', null);
                }
              })
              .catch((err) => console.error('Error loading districts:', err))
              .finally(() => setLoadingDistricts(false));
          } else {
            setDistricts([]);
            updateData('district_id', null);
          }
        }}
      />

      {/* Section 3: Education and Pricing */}
      <EducationSection
        data={{
          accepted_grades: data.accepted_grades,
          primary_languages: data.primary_languages,
          curriculum: data.curriculum,
          pricing_tiers: data.pricing_tiers,
        }}
        onDataChange={(key, value) => {
          updateData(key as keyof WizardData, value as any);
        }}
      />

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button variant="outline" asChild>
          <a href="/admin/schools">Bekor qilish</a>
        </Button>
        <Button onClick={handleSubmit} disabled={loading} size="lg">
          {loading ? 'Yaratilmoqda...' : 'Maktabni yaratish ✓'}
        </Button>
      </div>
    </div>
  );
}


