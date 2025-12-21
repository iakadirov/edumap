'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/contexts/ToastContext';
import { saveInstagram, saveFacebook, saveYouTube } from '@/lib/utils/social-media';
import { Upload, X, Loader2, Image as ImageIcon, Building2, Globe, User, Calendar, Phone, Mail, FileText, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/phone-input';
import { normalizePhone } from '@/lib/utils/phone';

interface BrandFormProps {
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    banner_url?: string | null;
    cover_image_url?: string | null;
    short_description?: string | null;
    website?: string | null;
    founder?: string | null;
    description?: string | null;
    founded_year?: number | null;
    phone?: string | null;
    email?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
  };
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
          setPreview(null);
        }
      } catch (err) {
        console.error('Error loading image URL:', err);
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
      <div className={cn('border-2 border-dashed rounded-lg p-4', previewSize)}>
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-contain rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
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

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(brand?.name || '');
  const [slug, setSlug] = useState(brand?.slug || '');
  const [logoUrl, setLogoUrl] = useState(brand?.logo_url || null);
  const [bannerUrl, setBannerUrl] = useState(brand?.banner_url || brand?.cover_image_url || null);
  const [shortDescription, setShortDescription] = useState(brand?.short_description || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [founder, setFounder] = useState(brand?.founder || '');
  const [description, setDescription] = useState(brand?.description || '');
  const [foundedYear, setFoundedYear] = useState(brand?.founded_year?.toString() || '');
  const [phone, setPhone] = useState(brand?.phone || '');
  const [email, setEmail] = useState(brand?.email || '');
  const [telegram, setTelegram] = useState(brand?.telegram || '');
  const [instagram, setInstagram] = useState(brand?.instagram || '');
  const [facebook, setFacebook] = useState(brand?.facebook || '');
  const [youtube, setYoutube] = useState(brand?.youtube || '');

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Автоматически генерируем slug из названия, если slug пустой или совпадает со старым
    if (!brand || slug === generateSlug(brand.name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!name || !slug) {
        throw new Error('Nomi va slug majburiy');
      }

      // Нормализуем социальные сети
      const normalizedInstagram = saveInstagram(instagram);
      const normalizedFacebook = saveFacebook(facebook);
      const normalizedYouTube = saveYouTube(youtube);

      const brandData = {
        name,
        slug,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        cover_image_url: bannerUrl || null, // Для обратной совместимости
        short_description: shortDescription || null,
        website: website || null,
        founder: founder || null,
        description: description || null,
        founded_year: foundedYear ? parseInt(foundedYear) : null,
        phone: normalizePhone(phone) || null,
        email: email || null,
        telegram: telegram || null,
        instagram: normalizedInstagram,
        facebook: normalizedFacebook,
        youtube: normalizedYouTube,
      };

      const url = brand
        ? `/api/admin/brands/${brand.id}`
        : '/api/admin/brands';
      const method = brand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Xatolik yuz berdi');
      }

      showToast({
        type: 'success',
        title: brand ? 'Brend yangilandi' : 'Brend yaratildi',
        description: brand ? 'Brend ma\'lumotlari muvaffaqiyatli yangilandi' : 'Yangi brend muvaffaqiyatli yaratildi',
        duration: 3000,
      });

      router.push('/admin/brands');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      showToast({
        type: 'error',
        title: 'Xatolik',
        description: err.message || 'Xatolik yuz berdi',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Asosiy ma'lumotlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Brend nomi *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Registon Maktablari"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Slug (URL) *
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="registon"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL: edumap.uz/brands/{slug || 'slug'}
              </p>
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
                placeholder="https://registon.uz"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploadField
                label="Logotip"
                value={logoUrl || undefined}
                onChange={(url) => setLogoUrl(url || null)}
                type="logo"
                previewSize="w-32 h-32"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploadField
                label="Banner (qopqoq rasm)"
                value={bannerUrl || undefined}
                onChange={(url) => setBannerUrl(url || null)}
                type="cover"
                previewSize="w-full h-48"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shortDescription" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Qisqa tavsif (160 belgigacha)
              </Label>
              <Textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brend haqida qisqa ma'lumot..."
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {shortDescription.length}/160 belgi
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founder" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Asoschisi
              </Label>
              <Input
                id="founder"
                value={founder}
                onChange={(e) => setFounder(e.target.value)}
                placeholder="Asoschi ismi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foundedYear" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tashkil etilgan yili
              </Label>
              <Input
                id="foundedYear"
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="2015"
                min="1900"
                max={new Date().getFullYear() + 10}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tavsif
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brend haqida batafsil ma'lumot..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Kontaktlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefon
              </Label>
              <PhoneInput
                id="phone"
                value={phone}
                onChange={(value) => setPhone(value)}
              />
            </div>
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
                placeholder="info@brand.uz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Telegram
              </Label>
              <Input
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username yoki https://t.me/username"
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
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : brand ? 'Saqlash' : 'Yaratish'}
        </Button>
      </div>
    </form>
  );
}

