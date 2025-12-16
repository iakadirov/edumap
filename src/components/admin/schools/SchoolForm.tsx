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

interface SchoolFormProps {
  organization?: any;
  schoolDetails?: any;
}

export function SchoolForm({ organization, schoolDetails }: SchoolFormProps) {
  const router = useRouter();
  const isEdit = !!organization;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Основная информация
  const [nameUz, setNameUz] = useState(organization?.name_uz || '');
  const [description, setDescription] = useState(organization?.description || '');
  const [shortDescription, setShortDescription] = useState(organization?.short_description || '');
  const [status, setStatus] = useState(organization?.status || 'pending');
  const [isVerified, setIsVerified] = useState(organization?.is_verified || false);

  // Контакты
  const [phone, setPhone] = useState(organization?.phone || '');
  const [phoneAdmission, setPhoneAdmission] = useState(organization?.phone_admission || '');
  const [email, setEmail] = useState(organization?.email || '');
  const [emailAdmission, setEmailAdmission] = useState(organization?.email_admission || '');
  const [website, setWebsite] = useState(organization?.website || '');

  // Адрес
  const [address, setAddress] = useState(organization?.address || '');
  const [landmark, setLandmark] = useState(organization?.landmark || '');

  // School Details
  const [schoolType, setSchoolType] = useState(schoolDetails?.school_type || 'private');
  const [gradeFrom, setGradeFrom] = useState(schoolDetails?.grade_from?.toString() || '1');
  const [gradeTo, setGradeTo] = useState(schoolDetails?.grade_to?.toString() || '11');
  const [acceptsPreparatory, setAcceptsPreparatory] = useState(schoolDetails?.accepts_preparatory || false);
  const [primaryLanguage, setPrimaryLanguage] = useState(schoolDetails?.primary_language || 'uzbek');
  const [totalStudents, setTotalStudents] = useState(schoolDetails?.total_students?.toString() || '');
  const [avgClassSize, setAvgClassSize] = useState(schoolDetails?.avg_class_size?.toString() || '');
  const [feeMonthlyMin, setFeeMonthlyMin] = useState(schoolDetails?.fee_monthly_min?.toString() || '');
  const [feeMonthlyMax, setFeeMonthlyMax] = useState(schoolDetails?.fee_monthly_max?.toString() || '');
  const [hasTransport, setHasTransport] = useState(schoolDetails?.has_transport || false);
  const [hasMeals, setHasMeals] = useState(schoolDetails?.has_meals || false);
  const [hasExtendedDay, setHasExtendedDay] = useState(schoolDetails?.has_extended_day || false);
  const [curriculum, setCurriculum] = useState<string[]>(schoolDetails?.curriculum || []);

  // Генерация slug из названия
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Валидация
      if (!nameUz) {
        setError('Maktab nomi kiritilishi kerak');
        setLoading(false);
        return;
      }

      const slug = isEdit ? organization.slug : generateSlug(nameUz || 'school');

      // Подготовка данных
      const organizationData = {
        org_type: 'school',
        name: nameUz || 'School',
        name_uz: nameUz || null,
        ...(isEdit ? {} : { slug }),
        description: description || null,
        short_description: shortDescription || null,
        status,
        is_verified: isVerified,
        phone: phone || null,
        phone_admission: phoneAdmission || null,
        email: email || null,
        email_admission: emailAdmission || null,
        website: website || null,
        address: address || null,
        landmark: landmark || null,
      };

      const schoolDetailsData = {
        school_type: schoolType,
        grade_from: parseInt(gradeFrom),
        grade_to: parseInt(gradeTo),
        accepts_preparatory: acceptsPreparatory,
        primary_language: primaryLanguage,
        total_students: totalStudents ? parseInt(totalStudents) : null,
        avg_class_size: avgClassSize ? parseInt(avgClassSize) : null,
        fee_monthly_min: feeMonthlyMin ? parseFloat(feeMonthlyMin) : null,
        fee_monthly_max: feeMonthlyMax ? parseFloat(feeMonthlyMax) : null,
        has_transport: hasTransport,
        has_meals: hasMeals,
        has_extended_day: hasExtendedDay,
        curriculum: curriculum.length > 0 ? curriculum : null,
      };

      const url = isEdit ? `/api/admin/schools/${organization.id}` : '/api/admin/schools';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: organizationData,
          school_details: schoolDetailsData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        setError(data.error || 'Xatolik yuz berdi. Konsolni tekshiring.');
        setLoading(false);
        return;
      }

      // Успешно сохранено
      if (isEdit) {
        // Используем window.location для полной перезагрузки
        window.location.href = `/admin/schools/${organization.id}`;
      } else {
        // Редирект на страницу редактирования
        window.location.href = `/admin/schools/${data.id}`;
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      setLoading(false);
    }
  };

  const toggleCurriculum = (value: string) => {
    setCurriculum((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shortDescription">Qisqa tavsif</Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Qisqa tavsif (bir necha so'z)"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">To'liq tavsif</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Maktab haqida batafsil ma'lumot"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="inactive">Nofaol</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox
              id="isVerified"
              checked={isVerified}
              onCheckedChange={(checked) => setIsVerified(checked === true)}
            />
            <Label htmlFor="isVerified" className="cursor-pointer">
              Tasdiqlangan
            </Label>
          </div>
        </div>
      </div>

      {/* Контакты */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Aloqa ma'lumotlari</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneAdmission">Qabul telefon</Label>
            <Input
              id="phoneAdmission"
              type="tel"
              value={phoneAdmission}
              onChange={(e) => setPhoneAdmission(e.target.value)}
              placeholder="+998901234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@school.uz"
            />
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Veb-sayt</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://school.uz"
            />
          </div>
        </div>
      </div>

      {/* Адрес */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manzil</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">To'liq manzil</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ko'cha nomi, uy raqami"
            />
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
            <Label htmlFor="totalStudents">Jami o'quvchilar soni</Label>
            <Input
              id="totalStudents"
              type="number"
              value={totalStudents}
              onChange={(e) => setTotalStudents(e.target.value)}
              placeholder="500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgClassSize">O'rtacha sinf hajmi</Label>
            <Input
              id="avgClassSize"
              type="number"
              value={avgClassSize}
              onChange={(e) => setAvgClassSize(e.target.value)}
              placeholder="25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeMonthlyMin">Oylik to'lov (min, so'm)</Label>
            <Input
              id="feeMonthlyMin"
              type="number"
              value={feeMonthlyMin}
              onChange={(e) => setFeeMonthlyMin(e.target.value)}
              placeholder="3000000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeMonthlyMax">Oylik to'lov (max, so'm)</Label>
            <Input
              id="feeMonthlyMax"
              type="number"
              value={feeMonthlyMax}
              onChange={(e) => setFeeMonthlyMax(e.target.value)}
              placeholder="5000000"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>O'quv dasturi</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              {['national', 'cambridge', 'ib'].map((cur) => (
                <div key={cur} className="flex items-center space-x-2">
                  <Checkbox
                    id={`curriculum-${cur}`}
                    checked={curriculum.includes(cur)}
                    onCheckedChange={() => toggleCurriculum(cur)}
                  />
                  <Label
                    htmlFor={`curriculum-${cur}`}
                    className="cursor-pointer capitalize"
                  >
                    {cur === 'national' ? 'Milliy' : cur === 'cambridge' ? 'Cambridge' : 'IB'}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Qo'shimcha xizmatlar</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasTransport"
                  checked={hasTransport}
                  onCheckedChange={(checked) => setHasTransport(checked === true)}
                />
                <Label htmlFor="hasTransport" className="cursor-pointer">
                  Transport xizmati
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMeals"
                  checked={hasMeals}
                  onCheckedChange={(checked) => setHasMeals(checked === true)}
                />
                <Label htmlFor="hasMeals" className="cursor-pointer">
                  Ovqatlanish
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasExtendedDay"
                  checked={hasExtendedDay}
                  onCheckedChange={(checked) => setHasExtendedDay(checked === true)}
                />
                <Label htmlFor="hasExtendedDay" className="cursor-pointer">
                  Kengaytirilgan kun
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </div>
    </form>
  );
}

