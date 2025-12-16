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
import { Checkbox } from '@/components/ui/checkbox';
import { useAutosave, formatAutosaveStatus } from '@/lib/schools/autosave';
import { validateBasicSection } from '@/lib/schools/section-validators';
import { calculateSectionProgress } from '@/lib/schools/progress-calculator';
import { saveTelegram } from '@/lib/utils/telegram';
import { YandexMap } from './YandexMap';

interface BasicInfoFormProps {
  organization: any;
  schoolDetails?: any;
}

export function BasicInfoForm({ organization, schoolDetails }: BasicInfoFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Основная информация
  const [nameUz, setNameUz] = useState(organization?.name_uz || '');
  const [description, setDescription] = useState(organization?.description || '');
  const [shortDescription, setShortDescription] = useState(organization?.short_description || '');
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url || '');

  // Контакты
  const [phone, setPhone] = useState(organization?.phone || '');
  const [phone2, setPhone2] = useState(organization?.phone_secondary || '');
  const [phone2Comment, setPhone2Comment] = useState((organization as any)?.phone_secondary_comment || '');
  const [phone3, setPhone3] = useState(organization?.phone_admission || '');
  const [phone3Comment, setPhone3Comment] = useState((organization as any)?.phone_admission_comment || '');
  const [email, setEmail] = useState(organization?.email || '');
  const [emailAdmission, setEmailAdmission] = useState(organization?.email_admission || '');
  const [website, setWebsite] = useState(organization?.website || '');
  const [telegram, setTelegram] = useState(organization?.telegram || '');

  // Адрес
  const [regionId, setRegionId] = useState<number | null>(organization?.region_id || null);
  const [districtId, setDistrictId] = useState<number | null>(organization?.district_id || null);
  const [address, setAddress] = useState(organization?.address || '');
  const [landmark, setLandmark] = useState(organization?.landmark || '');
  const [lat, setLat] = useState<number | null>(organization?.lat || null);
  const [lng, setLng] = useState<number | null>(organization?.lng || null);

  // School Details
  const [schoolType, setSchoolType] = useState(schoolDetails?.school_type || 'private');
  const [gradeFrom, setGradeFrom] = useState(schoolDetails?.grade_from?.toString() || '1');
  const [gradeTo, setGradeTo] = useState(schoolDetails?.grade_to?.toString() || '11');
  const [acceptsPreparatory, setAcceptsPreparatory] = useState(schoolDetails?.accepts_preparatory || false);
  const [primaryLanguage, setPrimaryLanguage] = useState(schoolDetails?.primary_language || 'uzbek');
  const [feeMonthlyMin, setFeeMonthlyMin] = useState(schoolDetails?.fee_monthly_min?.toString() || '');
  const [feeMonthlyMax, setFeeMonthlyMax] = useState(schoolDetails?.fee_monthly_max?.toString() || '');

  const [regions, setRegions] = useState<Array<{ id: number; name_uz: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: number; name_uz: string }>>([]);

  // Загрузка регионов
  useEffect(() => {
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => setRegions(data.regions || []))
      .catch(console.error);
  }, []);

  // Загрузка районов при выборе региона
  useEffect(() => {
    if (regionId) {
      fetch(`/api/districts?region=${regionId}`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []))
        .catch(console.error);
    } else {
      setDistricts([]);
    }
  }, [regionId]);

  // Формируем данные для автосохранения
  const formData = {
    name_uz: nameUz,
    description,
    short_description: shortDescription,
    phone,
    email,
    address,
    lat,
    lng,
    grade_from: parseInt(gradeFrom),
    grade_to: parseInt(gradeTo),
    fee_monthly_min: parseFloat(feeMonthlyMin) || 0,
    fee_monthly_max: parseFloat(feeMonthlyMax) || 0,
  };

  // Автосохранение
  const { status: autosaveStatus, save } = useAutosave({
    data: formData,
    onSave: async (data) => {
      // Вычисляем прогресс
      const progress = calculateSectionProgress('basic', data);

      // Валидация
      const validation = validateBasicSection(data);
      if (!validation.valid) {
        const errors: Record<string, string> = {};
        validation.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
        throw new Error('Validation failed');
      }

      setValidationErrors({});

      // Сохраняем данные
      const response = await fetch(`/api/admin/schools/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: {
            name_uz: data.name_uz || null,
            description: data.description || null,
            short_description: data.short_description || null,
            phone: data.phone || null,
            phone_secondary: phone2 || null,
            phone_secondary_comment: phone2Comment || null,
            phone_admission: phone3 || null,
            phone_admission_comment: phone3Comment || null,
            email: data.email || null,
            website: website || null,
            telegram: saveTelegram(telegram),
            region_id: regionId,
            district_id: districtId,
            address: data.address || null,
            landmark: landmark || null,
            lat: data.lat,
            lng: data.lng,
            logo_url: logoUrl || null,
          },
          school_details: {
            school_type: schoolType,
            grade_from: data.grade_from,
            grade_to: data.grade_to,
            accepts_preparatory: acceptsPreparatory,
            primary_language: primaryLanguage,
            fee_monthly_min: data.fee_monthly_min,
            fee_monthly_max: data.fee_monthly_max,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      // Обновляем прогресс
      await fetch(`/api/admin/schools/${organization.id}/sections/basic`, {
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

  return (
    <form className="space-y-8">
      {/* Индикатор автосохранения */}
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

      {/* Основная информация */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Asosiy ma'lumotlar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nameUz">Nomi (O'zbekcha) *</Label>
            <Input
              id="nameUz"
              value={nameUz}
              onChange={(e) => setNameUz(e.target.value)}
              placeholder="Maktab nomi"
              className={validationErrors.name ? 'border-destructive' : ''}
            />
            {validationErrors.name && (
              <p className="text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Qisqa tavsif</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Qisqa tavsif (bir necha so'z)"
              maxLength={160}
            />
            <p className="text-sm text-muted-foreground">
              {shortDescription.length}/160 символов
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">To'liq tavsif</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Maktab haqida batafsil ma'lumot"
              rows={6}
              className={validationErrors.description ? 'border-destructive' : ''}
            />
            {validationErrors.description && (
              <p className="text-sm text-destructive">{validationErrors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Логотип школы</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'logo');
                formData.append('organizationId', organization.id);

                try {
                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });

                  if (response.ok) {
                    const result = await response.json();
                    setLogoUrl(result.url);
                  }
                } catch (error) {
                  console.error('Error uploading logo:', error);
                }
              }}
            />
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Контакты */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Aloqa ma'lumotlari</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Основной телефон */}
          <div className="space-y-2">
            <Label htmlFor="phone">Asosiy telefon (Koll markaz) *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
              className={validationErrors.phone ? 'border-destructive' : ''}
            />
            {validationErrors.phone && (
              <p className="text-sm text-destructive">{validationErrors.phone}</p>
            )}
          </div>

          {/* Дополнительный телефон 1 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone2">Qo'shimcha telefon 1</Label>
              <Input
                id="phone2"
                type="tel"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="+998901234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone2Comment">Izoh (masalan: Qabul, Direktor)</Label>
              <Input
                id="phone2Comment"
                value={phone2Comment}
                onChange={(e) => setPhone2Comment(e.target.value)}
                placeholder="Qabul, Direktor, va hokazo"
              />
            </div>
          </div>

          {/* Дополнительный телефон 2 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone3">Qo'shimcha telefon 2</Label>
              <Input
                id="phone3"
                type="tel"
                value={phone3}
                onChange={(e) => setPhone3(e.target.value)}
                placeholder="+998901234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone3Comment">Izoh (masalan: Qabul, Direktor)</Label>
              <Input
                id="phone3Comment"
                value={phone3Comment}
                onChange={(e) => setPhone3Comment(e.target.value)}
                placeholder="Qabul, Direktor, va hokazo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@school.uz"
              className={validationErrors.email ? 'border-destructive' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailAdmission">Qabul email</Label>
            <Input
              id="emailAdmission"
              type="email"
              value={emailAdmission}
              onChange={(e) => setEmailAdmission(e.target.value)}
              placeholder="admission@school.uz"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Veb-sayt</Label>
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
              placeholder="@maktabsalam yoki https://t.me/maktabsalam yoki maktabsalam"
            />
            <p className="text-xs text-muted-foreground">
              Qabul qilinadi: @maktabsalam, https://t.me/maktabsalam, maktabsalam
            </p>
          </div>
        </div>
      </div>

      {/* Адрес */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manzil</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="region">Viloyat *</Label>
            <Select
              value={regionId?.toString() || ''}
              onValueChange={async (value) => {
                const id = parseInt(value);
                setRegionId(id);
                setDistrictId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Viloyatni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id.toString()}>
                    {region.name_uz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">Tuman *</Label>
            <Select
              value={districtId?.toString() || ''}
              onValueChange={(value) => setDistrictId(parseInt(value))}
              disabled={!regionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tumanni tanlang" />
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
            <Label htmlFor="address">To'liq manzil *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Manzil avtomatik to'ldiriladi yoki qo'lda kiriting"
              className={validationErrors.address ? 'border-destructive' : ''}
            />
            {validationErrors.address && (
              <p className="text-sm text-destructive">{validationErrors.address}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Manzil kartadan avtomatik to'ldiriladi yoki qo'lda kiriting
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="landmark">O'rnatilgan joy</Label>
            <Input
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Yaqin atrofdagi diqqatga sazovor joylar"
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

      {/* School Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Maktab tafsilotlari</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schoolType">Maktab turi *</Label>
            <Select value={schoolType} onValueChange={setSchoolType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Xususiy</SelectItem>
                <SelectItem value="state">Davlat</SelectItem>
                <SelectItem value="international">Xalqaro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="primaryLanguage">Asosiy til *</Label>
            <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uzbek">O'zbek</SelectItem>
                <SelectItem value="russian">Rus</SelectItem>
                <SelectItem value="english">Ingliz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeFrom">Sinflar (dan) *</Label>
            <Select value={gradeFrom} onValueChange={setGradeFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    {grade === 0 ? '0 (Tayyorgarlik)' : grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeTo">Sinflar (gacha) *</Label>
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
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="acceptsPreparatory"
              checked={acceptsPreparatory}
              onCheckedChange={(checked) => setAcceptsPreparatory(checked === true)}
            />
            <Label htmlFor="acceptsPreparatory" className="cursor-pointer">
              0-sinf (Tayyorgarlik sinfi) qabul qiladi
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeMonthlyMin">Oylik to'lov (min, so'm) *</Label>
            <Input
              id="feeMonthlyMin"
              type="number"
              value={feeMonthlyMin}
              onChange={(e) => setFeeMonthlyMin(e.target.value)}
              placeholder="3000000"
              className={validationErrors.fee_monthly_min ? 'border-destructive' : ''}
            />
            {validationErrors.fee_monthly_min && (
              <p className="text-sm text-destructive">{validationErrors.fee_monthly_min}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeMonthlyMax">Oylik to'lov (max, so'm) *</Label>
            <Input
              id="feeMonthlyMax"
              type="number"
              value={feeMonthlyMax}
              onChange={(e) => setFeeMonthlyMax(e.target.value)}
              placeholder="5000000"
              className={validationErrors.fee_monthly_max ? 'border-destructive' : ''}
            />
            {validationErrors.fee_monthly_max && (
              <p className="text-sm text-destructive">{validationErrors.fee_monthly_max}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Bekor qilish
        </Button>
        <Button type="button" onClick={handleManualSave}>
          Saqlash
        </Button>
      </div>
    </form>
  );
}
