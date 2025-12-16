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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveTelegram } from '@/lib/utils/telegram';
import { saveInstagram, saveFacebook, saveYouTube } from '@/lib/utils/social-media';
import { YandexMap } from './YandexMap';
import { BrandSearch } from '@/components/admin/brands/BrandSearch';
import { Upload, X, Loader2, Image as ImageIcon, Phone, Mail, Globe, MessageCircle, Building2, GraduationCap, DollarSign, MapPin, School, BookOpen, Languages, FileText, BookMarked, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [brandId, setBrandId] = useState<string | null>(null);

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
          if (data.district_id && !districtsList.some((d: any) => d.id === data.district_id)) {
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

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
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
      const slug = generateSlug(data.name_uz || 'school');

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
        phone: data.phone,
        phone_secondary: data.phone2?.phone || null,
        phone_secondary_comment: data.phone2?.comment || null,
        phone_admission: data.phone3?.phone || null,
        phone_admission_comment: data.phone3?.comment || null,
        email: data.email || null,
        website: data.website || null,
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
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name_uz" className="flex items-center gap-2">
                <School className="w-4 h-4" />
                Maktab nomi (O'zbekcha) *
              </Label>
              <Input
                id="name_uz"
                value={data.name_uz}
                onChange={(e) => updateData('name_uz', e.target.value)}
                placeholder="Cambridge School Tashkent"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school_type" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Maktab turi *
              </Label>
              <Select
                value={data.school_type}
                onValueChange={(value) => updateData('school_type', value)}
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
                value={data.description}
                onChange={(e) => updateData('description', e.target.value)}
                placeholder="Xalqaro maktab Cambridge dasturi bilan..."
                rows={4}
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">
                {data.description.length}/200 belgi
              </p>
            </div>
            
            {/* Logo and Banner Upload */}
            <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
              {/* Logo Upload */}
              <ImageUploadField
                label="Logotip"
                value={data.logo_url}
                onChange={(url) => updateData('logo_url', url)}
                type="logo"
                previewSize="w-32 h-32"
              />
              
              {/* Banner Upload */}
              <ImageUploadField
                label="Banner"
                value={data.banner_url}
                onChange={(url) => updateData('banner_url', url)}
                type="cover"
                previewSize="w-full h-32"
              />
            </div>
            
            {/* Brand Search */}
            <div className="md:col-span-2">
              <BrandSearch
                value={brandId}
                onChange={setBrandId}
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
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => updateData('phone', e.target.value)}
                placeholder="+998901234567"
              />
            </div>

            {/* Дополнительный телефон 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone2" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Qo'shimcha telefon 1
                </Label>
                <Input
                  id="phone2"
                  type="tel"
                  value={data.phone2?.phone || ''}
                  onChange={(e) => updateData('phone2', { ...data.phone2, phone: e.target.value } as PhoneWithComment)}
                  placeholder="+998901234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2_comment">Izoh (masalan: Qabul, Direktor)</Label>
                <Input
                  id="phone2_comment"
                  value={data.phone2?.comment || ''}
                  onChange={(e) => updateData('phone2', { ...data.phone2, phone: data.phone2?.phone || '', comment: e.target.value } as PhoneWithComment)}
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
                <Input
                  id="phone3"
                  type="tel"
                  value={data.phone3?.phone || ''}
                  onChange={(e) => updateData('phone3', { ...data.phone3, phone: e.target.value } as PhoneWithComment)}
                  placeholder="+998901234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone3_comment">Izoh (masalan: Qabul, Direktor)</Label>
                <Input
                  id="phone3_comment"
                  value={data.phone3?.comment || ''}
                  onChange={(e) => updateData('phone3', { ...data.phone3, phone: data.phone3?.phone || '', comment: e.target.value } as PhoneWithComment)}
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
                value={data.email}
                onChange={(e) => updateData('email', e.target.value)}
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
                value={data.website}
                onChange={(e) => updateData('website', e.target.value)}
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
                value={data.telegram}
                onChange={(e) => updateData('telegram', e.target.value)}
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
                value={data.instagram}
                onChange={(e) => updateData('instagram', e.target.value)}
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
                value={data.facebook}
                onChange={(e) => updateData('facebook', e.target.value)}
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
                value={data.youtube}
                onChange={(e) => updateData('youtube', e.target.value)}
                placeholder="@channel yoki https://youtube.com/@channel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Viloyat *
              </Label>
              <Select
                value={data.region_id?.toString() || 'all'}
                onValueChange={(value) =>
                  updateData('region_id', value === 'all' ? null : parseInt(value))
                }
                disabled={loadingRegions}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingRegions ? "Yuklanmoqda..." : "Viloyatni tanlang"} />
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
                value={data.district_id?.toString() || ''}
                onValueChange={(value) =>
                  updateData('district_id', value ? parseInt(value) : null)
                }
                disabled={!data.region_id || loadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !data.region_id 
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
                value={data.address}
                onChange={(e) => updateData('address', e.target.value)}
                placeholder="Manzil avtomatik to'ldiriladi yoki qo'lda kiriting"
              />
              <p className="text-xs text-muted-foreground">
                Manzil kartadan avtomatik to'ldiriladi yoki qo'lda kiriting
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="landmark">Yo'naltiruvchi</Label>
              <Input
                id="landmark"
                value={data.landmark}
                onChange={(e) => updateData('landmark', e.target.value)}
                placeholder="Yaqinida..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <YandexMap
                lat={data.lat}
                lng={data.lng}
                onCoordinatesChange={(lat, lng) => {
                  updateData('lat', lat);
                  updateData('lng', lng);
                }}
                onAddressChange={(address) => {
                  updateData('address', address);
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
                  const isSelected = data.accepted_grades.includes(grade);
                  return (
                    <Button
                      key={grade}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          updateData(
                            'accepted_grades',
                            data.accepted_grades.filter((g) => g !== grade)
                          );
                        } else {
                          updateData('accepted_grades', [...data.accepted_grades, grade].sort((a, b) => a - b));
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
                  const isSelected = data.primary_languages.includes(lang);
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
                          updateData(
                            'primary_languages',
                            data.primary_languages.filter((l) => l !== lang)
                          );
                        } else {
                          updateData('primary_languages', [...data.primary_languages, lang]);
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
                  const isSelected = data.curriculum.includes(prog.value);
                  return (
                    <Button
                      key={prog.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          updateData(
                            'curriculum',
                            data.curriculum.filter((c) => c !== prog.value)
                          );
                        } else {
                          updateData('curriculum', [...data.curriculum, prog.value]);
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
                    updateData('pricing_tiers', [
                      ...data.pricing_tiers,
                      { grades: [], price: null },
                    ]);
                  }}
                >
                  + Prays qo'shish
                </Button>
              </div>
              <div className="space-y-3">
                {data.pricing_tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Sinflar
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {data.accepted_grades.map((grade) => (
                          <div key={grade} className="flex items-center space-x-1">
                            <Checkbox
                              id={`tier-${index}-grade-${grade}`}
                              checked={tier.grades.includes(grade)}
                              onCheckedChange={(checked) => {
                                const newTiers = [...data.pricing_tiers];
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
                                updateData('pricing_tiers', newTiers);
                              }}
                            />
                            <Label
                              htmlFor={`tier-${index}-grade-${grade}`}
                              className="cursor-pointer text-sm"
                            >
                              {grade === 0 ? '0' : grade}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-48">
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Narx (so'm)
                      </Label>
                      <Input
                        type="number"
                        value={tier.price || ''}
                        onChange={(e) => {
                          const newTiers = [...data.pricing_tiers];
                          newTiers[index].price =
                            e.target.value === ''
                              ? null
                              : parseFloat(e.target.value) || null;
                          updateData('pricing_tiers', newTiers);
                        }}
                        placeholder="3000000"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateData(
                          'pricing_tiers',
                          data.pricing_tiers.filter((_, i) => i !== index)
                        );
                      }}
                      className="mt-6"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                {data.pricing_tiers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Prays qo'shilmagan
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

// Компонент для загрузки изображений (логотип и баннер)
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
      setPreview(data.url);
      onChange(data.url);
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="flex flex-col gap-2">
        {/* Preview */}
        {preview && (
          <div className={cn('relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50', previewSize)}>
            <img
              src={preview}
              alt={label}
              className={cn(
                'object-cover w-full h-full',
                type === 'logo' ? 'object-contain' : 'object-cover'
              )}
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                aria-label={`${label}ni o'chirish`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={uploading}
            className="w-full"
            size="sm"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : preview ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                O'zgartirish
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                {label} yuklash
              </>
            )}
          </Button>

          {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, SVG, WebP, GIF. Maksimal 10MB
          </p>
        </div>
      </div>
    </div>
  );
}

