# UI/UX: Страница профиля школы — /schools/[slug]

> **Страница**: `/schools/[slug]`
> **Тип**: Детальная страница учреждения
> **Версия**: 1.0
> **Дата**: Декабрь 2024

---

## 1. Общая структура страницы

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  BREADCRUMBS                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  HERO: Фото + Название + Рейтинг + Badges + Quick Info                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  ┌──────────────┐ │
│  │                                                      │  │              │ │
│  │  TABS NAVIGATION                                     │  │   SIDEBAR    │ │
│  │  ────────────────────────────────────────────────── │  │              │ │
│  │                                                      │  │  Контакты    │ │
│  │  TAB CONTENT                                         │  │  Цена        │ │
│  │                                                      │  │  Действия    │ │
│  │  • О школе                                           │  │  Карта       │ │
│  │  • Программа                                         │  │              │ │
│  │  • Учителя                                           │  │              │ │
│  │  • Инфраструктура                                    │  │              │ │
│  │  • Отзывы                                            │  │              │ │
│  │  • Поступление                                       │  │              │ │
│  │  • Цены                                              │  │              │ │
│  │                                                      │  │              │ │
│  └─────────────────────────────────────────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ПОХОЖИЕ ШКОЛЫ                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Размеры сетки

| Элемент | Ширина | Примечание |
|---------|--------|------------|
| Контейнер | max-w-7xl (1280px) | Центрирован |
| Main content | flex-1 (~720px) | Левая колонка |
| Sidebar | 320px fixed | Правая колонка, sticky |
| Gap | 32px | Между колонками |

---

## 2. HERO секция

### Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Главная > Школы > Cambridge School Tashkent                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │                                                                      │   │
│  │                         ГЛАВНОЕ ФОТО                                 │   │
│  │                         (full width, 400px height)                   │   │
│  │                                                                      │   │
│  │  ┌──────────┐                                           ┌─────────┐ │   │
│  │  │ #3 в     │                                           │ 📷 12   │ │   │
│  │  │ рейтинге │                                           │ фото    │ │   │
│  │  └──────────┘                                           └─────────┘ │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ┌────────┐                                                          │   │
│  │  │        │  Cambridge School Tashkent                              │   │
│  │  │  ЛОГО  │                                                          │   │
│  │  │        │  ✓ Верифицирована  🏆 TOP-10  🏅 Cambridge Award 2024   │   │
│  │  └────────┘                                                          │   │
│  │                                                                      │   │
│  │  ⭐⭐⭐⭐⭐ 4.8  •  127 отзывов  •  #3 в рейтинге школ               │   │
│  │                                                                      │   │
│  │  📍 Мирзо-Улугбекский район, ул. Паркентская, 128                   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                                                              │    │   │
│  │  │  🎓 Cambridge      🗣 Рус / Eng      📚 1-11 класс           │    │   │
│  │  │  International                       Билингвальная          │    │   │
│  │  │                                                              │    │   │
│  │  │  🏊 Бассейн   🚌 Транспорт   🍽 Питание   🔬 STEM   🎭 Театр │    │   │
│  │  │                                                              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### React компонент: SchoolHero

```tsx
// components/schools/SchoolHero.tsx

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Star, 
  CheckCircle, 
  Trophy, 
  Medal,
  Camera,
  GraduationCap,
  Languages,
  BookOpen
} from 'lucide-react';

interface SchoolHeroProps {
  school: {
    name: string;
    slug: string;
    logo: string;
    coverImage: string;
    photosCount: number;
    rating: {
      score: number;
      reviewCount: number;
      rank: number;
    };
    badges: {
      isVerified: boolean;
      ranking?: { type: string; };
      awards?: { name: string; year: number; }[];
    };
    location: {
      district: string;
      address: string;
    };
    curriculum: string;
    languages: string[];
    grades: { from: number; to: number; };
    isBilingual: boolean;
    features: string[];
  };
}

export function SchoolHero({ school }: SchoolHeroProps) {
  return (
    <section className="school-hero">
      {/* Cover Image */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
        <Image
          src={school.coverImage}
          alt={school.name}
          fill
          className="object-cover"
          priority
        />
        
        {/* Rank Badge on Photo */}
        {school.badges.ranking && (
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-3 py-2 rounded-lg font-bold shadow-lg">
            🥉 #{school.rating.rank} в рейтинге
          </div>
        )}
        
        {/* Photos Count */}
        <button className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-black/80 transition">
          <Camera className="w-4 h-4" />
          <span>{school.photosCount} фото</span>
        </button>
      </div>
      
      {/* School Info */}
      <div className="mt-6 flex gap-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0">
          <Image
            src={school.logo}
            alt={`${school.name} logo`}
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        
        {/* Info */}
        <div className="flex-1">
          {/* Name */}
          <h1 className="text-2xl font-bold text-gray-900">
            {school.name}
          </h1>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mt-2">
            {school.badges.isVerified && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                Верифицирована
              </Badge>
            )}
            {school.badges.ranking?.type === 'top10' && (
              <Badge variant="primary" className="gap-1">
                <Trophy className="w-3 h-3" />
                TOP-10
              </Badge>
            )}
            {school.badges.awards?.map((award) => (
              <Badge key={award.name} variant="purple" className="gap-1">
                <Medal className="w-3 h-3" />
                {award.name} {award.year}
              </Badge>
            ))}
          </div>
          
          {/* Rating Row */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(school.rating.score)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-900">
              {school.rating.score}
            </span>
            <span className="text-gray-500">•</span>
            <a href="#reviews" className="text-gray-600 hover:text-blue-600">
              {school.rating.reviewCount} отзывов
            </a>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">
              #{school.rating.rank} в рейтинге школ
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 mt-3 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{school.location.district}, {school.location.address}</span>
          </div>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Программа</div>
                <div className="font-medium text-gray-900">{school.curriculum}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Languages className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Языки</div>
                <div className="font-medium text-gray-900">
                  {school.languages.join(' / ')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Классы</div>
                <div className="font-medium text-gray-900">
                  {school.grades.from}-{school.grades.to} класс
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap gap-2 mt-4">
            {school.features.map((feature) => (
              <FeatureTag key={feature} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Tag Component
function FeatureTag({ feature }: { feature: string }) {
  const config: Record<string, { icon: string; label: string }> = {
    pool: { icon: '🏊', label: 'Бассейн' },
    transport: { icon: '🚌', label: 'Транспорт' },
    meals: { icon: '🍽', label: 'Питание' },
    stem: { icon: '🔬', label: 'STEM' },
    arts: { icon: '🎭', label: 'Театр' },
    music: { icon: '🎵', label: 'Музыка' },
    sports: { icon: '⚽', label: 'Спорт' },
  };
  
  const { icon, label } = config[feature] || { icon: '✓', label: feature };
  
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
```

---

## 3. TABS + SIDEBAR Layout

### Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────┐  ┌──────────────┐ │
│  │                                                      │  │              │ │
│  │  [О школе] [Программа] [Учителя] [Инфра] [Отзывы]   │  │   SIDEBAR    │ │
│  │  ─────────                                           │  │   (sticky)   │ │
│  │                                                      │  │              │ │
│  │  ┌────────────────────────────────────────────────┐ │  │  ┌─────────┐ │ │
│  │  │                                                 │ │  │  │  ЦЕНА   │ │ │
│  │  │              КОНТЕНТ ТАБА                       │ │  │  │         │ │ │
│  │  │                                                 │ │  │  │ от 3.5  │ │ │
│  │  │                                                 │ │  │  │ млн/мес │ │ │
│  │  │                                                 │ │  │  │         │ │ │
│  │  │                                                 │ │  │  │[Записать]│ │
│  │  │                                                 │ │  │  │[ся на  ]│ │ │
│  │  │                                                 │ │  │  │[визит  ]│ │ │
│  │  │                                                 │ │  │  └─────────┘ │ │
│  │  │                                                 │ │  │              │ │
│  │  │                                                 │ │  │  ┌─────────┐ │ │
│  │  │                                                 │ │  │  │КОНТАКТЫ │ │ │
│  │  │                                                 │ │  │  │         │ │ │
│  │  │                                                 │ │  │  │📞 +998..│ │ │
│  │  │                                                 │ │  │  │✉️ info@ │ │ │
│  │  │                                                 │ │  │  │🌐 site  │ │ │
│  │  │                                                 │ │  │  │💬 Tg    │ │ │
│  │  │                                                 │ │  │  └─────────┘ │ │
│  │  │                                                 │ │  │              │ │
│  │  │                                                 │ │  │  ┌─────────┐ │ │
│  │  │                                                 │ │  │  │  КАРТА  │ │ │
│  │  │                                                 │ │  │  │  [map]  │ │ │
│  │  │                                                 │ │  │  │         │ │ │
│  │  │                                                 │ │  │  └─────────┘ │ │
│  │  │                                                 │ │  │              │ │
│  │  └────────────────────────────────────────────────┘ │  │  ┌─────────┐ │ │
│  │                                                      │  │  │ДЕЙСТВИЯ │ │ │
│  └─────────────────────────────────────────────────────┘  │  │☐ Сравнить│ │
│                                                            │  │♡ Сохранит│ │
│       ~720px                                               │  │⚠️ Пожалов│ │
│                                                            │  └─────────┘ │ │
│                                                            │              │ │
│                                                            │   ~320px     │ │
│                                                            └──────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### React компонент: SchoolProfileLayout

```tsx
// components/schools/SchoolProfileLayout.tsx

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SchoolSidebar } from './SchoolSidebar';
import { AboutTab } from './tabs/AboutTab';
import { ProgramTab } from './tabs/ProgramTab';
import { TeachersTab } from './tabs/TeachersTab';
import { InfrastructureTab } from './tabs/InfrastructureTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { AdmissionTab } from './tabs/AdmissionTab';
import { PricingTab } from './tabs/PricingTab';

interface SchoolProfileLayoutProps {
  school: SchoolProfile;
}

export function SchoolProfileLayout({ school }: SchoolProfileLayoutProps) {
  const [activeTab, setActiveTab] = useState('about');
  
  const tabs = [
    { id: 'about', label: 'О школе', icon: '📋' },
    { id: 'program', label: 'Программа', icon: '📚' },
    { id: 'teachers', label: 'Учителя', icon: '👨‍🏫' },
    { id: 'infrastructure', label: 'Инфраструктура', icon: '🏗' },
    { id: 'reviews', label: 'Отзывы', icon: '💬', count: school.reviewCount },
    { id: 'admission', label: 'Поступление', icon: '📝' },
    { id: 'pricing', label: 'Цены', icon: '💰' },
  ];
  
  return (
    <div className="flex gap-8 max-w-7xl mx-auto px-4 py-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs Navigation */}
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative px-4 py-3 text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none bg-transparent"
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {tab.count && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Tab Contents */}
          <div className="mt-6">
            <TabsContent value="about">
              <AboutTab school={school} />
            </TabsContent>
            <TabsContent value="program">
              <ProgramTab school={school} />
            </TabsContent>
            <TabsContent value="teachers">
              <TeachersTab school={school} />
            </TabsContent>
            <TabsContent value="infrastructure">
              <InfrastructureTab school={school} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab school={school} />
            </TabsContent>
            <TabsContent value="admission">
              <AdmissionTab school={school} />
            </TabsContent>
            <TabsContent value="pricing">
              <PricingTab school={school} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0">
        <div className="sticky top-24">
          <SchoolSidebar school={school} />
        </div>
      </aside>
    </div>
  );
}
```

---

## 4. SIDEBAR

### Wireframe детальный

```
┌────────────────────────────────────┐
│                                    │
│  ┌──────────────────────────────┐  │
│  │        ЦЕНА И ЗАПИСЬ         │  │
│  │                              │  │
│  │  от 3 500 000 сум            │  │
│  │  ─────────────────           │  │
│  │  до 5 000 000 сум /месяц     │  │
│  │                              │  │
│  │  ┌────────────────────────┐  │  │
│  │  │                        │  │  │
│  │  │   Записаться на визит  │  │  │
│  │  │                        │  │  │
│  │  └────────────────────────┘  │  │
│  │                              │  │
│  │  ┌────────────────────────┐  │  │
│  │  │   Задать вопрос        │  │  │
│  │  └────────────────────────┘  │  │
│  │                              │  │
│  │  📅 Открыт набор на 2025/26  │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │         КОНТАКТЫ             │  │
│  │                              │  │
│  │  📞 +998 71 123 45 67        │  │
│  │  📞 +998 90 123 45 67        │  │
│  │                              │  │
│  │  ✉️ info@cambridge.uz        │  │
│  │                              │  │
│  │  🌐 cambridge.uz             │  │
│  │                              │  │
│  │  💬 @cambridgeschool_uz      │  │
│  │  📷 @cambridgeschool_uz      │  │
│  │  📘 Cambridge School         │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │          АДРЕС               │  │
│  │                              │  │
│  │  ┌────────────────────────┐  │  │
│  │  │                        │  │  │
│  │  │      [YANDEX MAP]      │  │  │
│  │  │                        │  │  │
│  │  │          📍            │  │  │
│  │  │                        │  │  │
│  │  └────────────────────────┘  │  │
│  │                              │  │
│  │  Мирзо-Улугбекский район    │  │
│  │  ул. Паркентская, 128       │  │
│  │                              │  │
│  │  [Построить маршрут →]      │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │         ДЕЙСТВИЯ             │  │
│  │                              │  │
│  │  ☐ Добавить к сравнению     │  │
│  │                              │  │
│  │  ♡ Сохранить в избранное    │  │
│  │                              │  │
│  │  📤 Поделиться               │  │
│  │                              │  │
│  │  ⚠️ Сообщить о проблеме      │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

### React компонент: SchoolSidebar

```tsx
// components/schools/SchoolSidebar.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Instagram,
  Facebook,
  MapPin,
  Navigation,
  Heart,
  Share2,
  AlertTriangle,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface SchoolSidebarProps {
  school: {
    fee: {
      min: number;
      max?: number;
      currency: string;
      period: string;
    };
    contacts: {
      phones: string[];
      email: string;
      website?: string;
      telegram?: string;
      instagram?: string;
      facebook?: string;
    };
    location: {
      district: string;
      address: string;
      coordinates: { lat: number; lng: number; };
    };
    hasOpenEnrollment: boolean;
    enrollmentYear?: string;
  };
  onCompareToggle: () => void;
  onSaveToggle: () => void;
  isInComparison: boolean;
  isSaved: boolean;
}

export function SchoolSidebar({
  school,
  onCompareToggle,
  onSaveToggle,
  isInComparison,
  isSaved
}: SchoolSidebarProps) {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };
  
  return (
    <div className="space-y-4">
      {/* Price & CTA Card */}
      <Card className="border-2 border-blue-100 bg-blue-50/30">
        <CardContent className="p-5">
          {/* Price */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Стоимость обучения</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-500">от</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(school.fee.min)}
              </span>
            </div>
            {school.fee.max && (
              <div className="text-gray-600">
                до {formatPrice(school.fee.max)} {school.fee.currency === 'UZS' ? 'сум' : '$'} 
                <span className="text-gray-400"> /{school.fee.period === 'month' ? 'месяц' : 'год'}</span>
              </div>
            )}
          </div>
          
          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Записаться на визит
            </Button>
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Задать вопрос
            </Button>
          </div>
          
          {/* Open Enrollment Badge */}
          {school.hasOpenEnrollment && (
            <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                Открыт набор на {school.enrollmentYear}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Contacts Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Контакты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Phones */}
          {school.contacts.phones.map((phone, idx) => (
            <a
              key={idx}
              href={`tel:${phone}`}
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
            >
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{phone}</span>
            </a>
          ))}
          
          {/* Email */}
          <a
            href={`mailto:${school.contacts.email}`}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{school.contacts.email}</span>
          </a>
          
          {/* Website */}
          {school.contacts.website && (
            <a
              href={school.contacts.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
            >
              <Globe className="w-4 h-4 text-gray-400" />
              <span>{school.contacts.website.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          )}
          
          {/* Social Links */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {school.contacts.telegram && (
              <a
                href={`https://t.me/${school.contacts.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                title="Telegram"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {school.contacts.instagram && (
              <a
                href={`https://instagram.com/${school.contacts.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {school.contacts.facebook && (
              <a
                href={school.contacts.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Map Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Адрес</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Map */}
          <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 overflow-hidden">
            <iframe
              src={`https://yandex.ru/map-widget/v1/?pt=${school.location.coordinates.lng},${school.location.coordinates.lat}&z=15&l=map`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              title="Карта"
            />
          </div>
          
          {/* Address Text */}
          <div className="flex items-start gap-2 text-gray-700 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">{school.location.district}</div>
              <div className="text-sm text-gray-500">{school.location.address}</div>
            </div>
          </div>
          
          {/* Directions Button */}
          <Button variant="outline" className="w-full" asChild>
            <a
              href={`https://yandex.ru/maps/?rtext=~${school.location.coordinates.lat},${school.location.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Построить маршрут
            </a>
          </Button>
        </CardContent>
      </Card>
      
      {/* Actions Card */}
      <Card>
        <CardContent className="p-4 space-y-2">
          {/* Compare */}
          <button
            onClick={onCompareToggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left"
          >
            <Checkbox checked={isInComparison} />
            <span className="text-gray-700">Добавить к сравнению</span>
          </button>
          
          {/* Save */}
          <button
            onClick={onSaveToggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left"
          >
            <Heart
              className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
            <span className="text-gray-700">
              {isSaved ? 'В избранном' : 'Сохранить в избранное'}
            </span>
          </button>
          
          {/* Share */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left">
            <Share2 className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Поделиться</span>
          </button>
          
          {/* Report */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left text-gray-500">
            <AlertTriangle className="w-5 h-5" />
            <span>Сообщить о проблеме</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. TAB: О школе (About)

### Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  О школе                                                                    │
│  ═══════                                                                    │
│                                                                             │
│  Cambridge School Tashkent — одна из ведущих международных школ            │
│  Узбекистана, основанная в 2010 году. Мы предлагаем образование           │
│  по программе Cambridge International от Primary до A-Level.               │
│                                                                             │
│  Наша миссия — воспитать глобально мыслящих лидеров, готовых к            │
│  поступлению в лучшие университеты мира...                                 │
│                                                                             │
│  [Читать полностью ▼]                                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Ключевые факты                                                            │
│  ───────────────                                                           │
│                                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │            │  │            │  │            │  │            │           │
│  │  🎓 2010   │  │  👨‍🎓 850   │  │  👨‍🏫 65    │  │  📚 1:13   │           │
│  │            │  │            │  │            │  │            │           │
│  │   Год      │  │ Учеников   │  │ Учителей   │  │ Учеников   │           │
│  │ основания  │  │            │  │            │  │ на учителя │           │
│  │            │  │            │  │            │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Фотогалерея                                               [Все фото →]    │
│  ────────────                                                              │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │         │ │         │ │         │ │         │ │         │             │
│  │  фото1  │ │  фото2  │ │  фото3  │ │  фото4  │ │  +8     │             │
│  │         │ │         │ │         │ │         │ │         │             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Видео о школе                                                             │
│  ─────────────                                                             │
│                                                                             │
│  ┌──────────────────────────────────┐                                      │
│  │                                   │                                      │
│  │              ▶️                    │                                      │
│  │         [YouTube Video]           │                                      │
│  │                                   │                                      │
│  └──────────────────────────────────┘                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Документы и лицензии                                                      │
│  ────────────────────                                                      │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  📄 Лицензия на образовательную деятельность         [Скачать PDF] │   │
│  │     Выдана: Министерство образования, 2020                         │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  📄 Сертификат Cambridge International                 [Скачать PDF] │   │
│  │     Cambridge Assessment International Education, 2019              │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### React компонент: AboutTab

```tsx
// components/schools/tabs/AboutTab.tsx

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  UserCheck, 
  BookOpen,
  Download,
  FileText,
  Play,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface AboutTabProps {
  school: {
    description: string;
    foundedYear: number;
    studentsCount: number;
    teachersCount: number;
    studentTeacherRatio: string;
    photos: { url: string; category: string; }[];
    videos: { url: string; title: string; thumbnail: string; }[];
    documents: { name: string; issuer: string; year: number; url: string; }[];
  };
}

export function AboutTab({ school }: AboutTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const stats = [
    {
      icon: GraduationCap,
      value: school.foundedYear,
      label: 'Год основания',
      color: 'blue'
    },
    {
      icon: Users,
      value: school.studentsCount,
      label: 'Учеников',
      color: 'green'
    },
    {
      icon: UserCheck,
      value: school.teachersCount,
      label: 'Учителей',
      color: 'purple'
    },
    {
      icon: BookOpen,
      value: school.studentTeacherRatio,
      label: 'Учеников на учителя',
      color: 'amber'
    }
  ];
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  
  return (
    <div className="space-y-8">
      {/* Description */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">О школе</h2>
        <div className={`prose prose-gray max-w-none ${!isExpanded && 'line-clamp-4'}`}>
          <p className="text-gray-700 leading-relaxed">{school.description}</p>
        </div>
        {school.description.length > 300 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
          >
            {isExpanded ? 'Свернуть' : 'Читать полностью'}
            <ChevronDown className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </section>
      
      {/* Key Facts */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ключевые факты</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6 pb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Photo Gallery */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Фотогалерея</h2>
          <Button variant="ghost" className="text-blue-600">
            Все фото
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {school.photos.slice(0, 4).map((photo, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
            >
              <Image
                src={photo.url}
                alt={`Фото ${idx + 1}`}
                width={150}
                height={150}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {school.photos.length > 4 && (
            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
              <span className="text-lg font-semibold text-gray-600">
                +{school.photos.length - 4}
              </span>
            </div>
          )}
        </div>
      </section>
      
      {/* Video */}
      {school.videos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Видео о школе</h2>
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer">
            <Image
              src={school.videos[0].thumbnail}
              alt={school.videos[0].title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Documents */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Документы и лицензии</h2>
        <div className="space-y-3">
          {school.documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{doc.name}</div>
                  <div className="text-sm text-gray-500">
                    {doc.issuer}, {doc.year}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={doc.url} download>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 6. TAB: Отзывы (Reviews)

### Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Отзывы                                                   [Написать отзыв] │
│  ═══════                                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │                              │  │                              │ │   │
│  │  │        4.8                   │  │  Качество обучения  ████████ │ │   │
│  │  │    ⭐⭐⭐⭐⭐                   │  │  Учителя           █████████ │ │   │
│  │  │                              │  │  Инфраструктура    ███████░░ │ │   │
│  │  │   127 отзывов                │  │  Питание           ██████░░░ │ │   │
│  │  │                              │  │  Коммуникация      ████████░ │ │   │
│  │  │                              │  │                              │ │   │
│  │  └──────────────────────────────┘  └──────────────────────────────┘ │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Фильтр: [Все] [5★] [4★] [3★] [2★] [1★]     Сортировка: [Сначала новые ▼] │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ┌──────┐  Малика К.                              ⭐⭐⭐⭐⭐  5.0    │   │
│  │  │      │  Мама ученика 3 класса                                    │   │
│  │  │  👩  │  ✓ Верифицированный родитель           2 недели назад    │   │
│  │  │      │                                                            │   │
│  │  └──────┘                                                            │   │
│  │                                                                      │   │
│  │  Отличная школа! Сын ходит с удовольствием. Учителя внимательные,  │   │
│  │  программа сильная. Особенно нравится подход к английскому языку.  │   │
│  │  За два года сын свободно заговорил.                                │   │
│  │                                                                      │   │
│  │  👍 Плюсы: Сильные учителя, хороший английский, современное здание │   │
│  │  👎 Минусы: Дорогая парковка, очереди в столовой                   │   │
│  │                                                                      │   │
│  │  ───────────────────────────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │  👍 Полезно (12)    💬 Ответить    🚩 Пожаловаться                  │   │
│  │                                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │  💬 Ответ от школы                              3 дня назад    │ │   │
│  │  │                                                                 │ │   │
│  │  │  Спасибо за отзыв! Мы работаем над улучшением работы столовой.│ │   │
│  │  │  С нового семестра добавим дополнительную кассу.              │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                         [Загрузить ещё отзывы]                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### React компонент: ReviewsTab

```tsx
// components/schools/tabs/ReviewsTab.tsx

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  Flag,
  ChevronDown
} from 'lucide-react';

interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    isVerified: boolean;
  };
  rating: number;
  date: string;
  content: string;
  pros?: string[];
  cons?: string[];
  helpfulCount: number;
  schoolResponse?: {
    content: string;
    date: string;
  };
}

interface ReviewsTabProps {
  school: {
    rating: {
      score: number;
      reviewCount: number;
      breakdown: {
        quality: number;
        teachers: number;
        infrastructure: number;
        meals: number;
        communication: number;
      };
    };
    reviews: Review[];
  };
}

export function ReviewsTab({ school }: ReviewsTabProps) {
  const [filter, setFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  
  const ratingCategories = [
    { key: 'quality', label: 'Качество обучения', value: school.rating.breakdown.quality },
    { key: 'teachers', label: 'Учителя', value: school.rating.breakdown.teachers },
    { key: 'infrastructure', label: 'Инфраструктура', value: school.rating.breakdown.infrastructure },
    { key: 'meals', label: 'Питание', value: school.rating.breakdown.meals },
    { key: 'communication', label: 'Коммуникация', value: school.rating.breakdown.communication },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header with Write Review Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Отзывы</h2>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          Написать отзыв
        </Button>
      </div>
      
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {school.rating.score}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(school.rating.score)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-500">
                {school.rating.reviewCount} отзывов
              </div>
            </div>
            
            {/* Rating Breakdown */}
            <div className="space-y-3">
              {ratingCategories.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-600">{cat.label}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(cat.value / 5) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm text-gray-600 text-right">
                    {cat.value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(null)}
          >
            Все
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filter === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
          <option value="highest">Высокий рейтинг</option>
          <option value="lowest">Низкий рейтинг</option>
          <option value="helpful">Полезные</option>
        </select>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        {school.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      
      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Загрузить ещё отзывы
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {review.author.avatar ? (
                <Image
                  src={review.author.avatar}
                  alt={review.author.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <span className="text-xl">👤</span>
              )}
            </div>
            
            {/* Author Info */}
            <div>
              <div className="font-medium text-gray-900">{review.author.name}</div>
              <div className="text-sm text-gray-500">{review.author.role}</div>
              {review.author.isVerified && (
                <Badge variant="outline" className="mt-1 text-xs text-green-700 border-green-200 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Верифицированный родитель
                </Badge>
              )}
            </div>
          </div>
          
          {/* Rating & Date */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
              <span className="ml-1 font-medium">{review.rating}.0</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{review.date}</div>
          </div>
        </div>
        
        {/* Content */}
        <p className="text-gray-700 mb-4">{review.content}</p>
        
        {/* Pros & Cons */}
        {(review.pros || review.cons) && (
          <div className="space-y-2 mb-4">
            {review.pros && review.pros.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-green-600">👍</span>
                <div>
                  <span className="text-sm font-medium text-gray-700">Плюсы: </span>
                  <span className="text-sm text-gray-600">{review.pros.join(', ')}</span>
                </div>
              </div>
            )}
            {review.cons && review.cons.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-red-600">👎</span>
                <div>
                  <span className="text-sm font-medium text-gray-700">Минусы: </span>
                  <span className="text-sm text-gray-600">{review.cons.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <ThumbsUp className="w-4 h-4" />
            Полезно ({review.helpfulCount})
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
            <MessageSquare className="w-4 h-4" />
            Ответить
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 ml-auto transition">
            <Flag className="w-4 h-4" />
            Пожаловаться
          </button>
        </div>
        
        {/* School Response */}
        {review.schoolResponse && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-800">💬 Ответ от школы</span>
              <span className="text-xs text-blue-600">{review.schoolResponse.date}</span>
            </div>
            <p className="text-sm text-blue-900">{review.schoolResponse.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 7. Похожие школы

### Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Похожие школы                                            [Все школы →]    │
│  ═════════════                                                              │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │                 │  │                 │  │                 │            │
│  │  [ФОТО]         │  │  [ФОТО]         │  │  [ФОТО]         │            │
│  │                 │  │                 │  │                 │            │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤            │
│  │                 │  │                 │  │                 │            │
│  │  Westminster    │  │  INHA School    │  │  Oxbridge       │            │
│  │  School         │  │                 │  │  International  │            │
│  │                 │  │                 │  │                 │            │
│  │  ⭐ 4.7 (89)    │  │  ⭐ 4.6 (64)    │  │  ⭐ 4.5 (52)    │            │
│  │  📍 Юнусабад    │  │  📍 Чиланзар    │  │  📍 Яккасарай   │            │
│  │  от 4.5 млн     │  │  от 6 млн       │  │  от 5 млн       │            │
│  │                 │  │                 │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### React компонент: SimilarSchools

```tsx
// components/schools/SimilarSchools.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, MapPin } from 'lucide-react';

interface SimilarSchool {
  id: string;
  slug: string;
  name: string;
  coverImage: string;
  rating: {
    score: number;
    reviewCount: number;
  };
  district: {
    name: string;
  };
  fee: {
    min: number;
  };
}

interface SimilarSchoolsProps {
  schools: SimilarSchool[];
  currentSchoolId: string;
}

export function SimilarSchools({ schools, currentSchoolId }: SimilarSchoolsProps) {
  const similarSchools = schools
    .filter(s => s.id !== currentSchoolId)
    .slice(0, 3);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };
  
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Похожие школы</h2>
        <Button variant="ghost" className="text-blue-600" asChild>
          <Link href="/schools/list">
            Все школы
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {similarSchools.map((school) => (
          <Link
            key={school.id}
            href={`/schools/${school.slug}`}
            className="block border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-md transition"
          >
            {/* Image */}
            <div className="aspect-[16/10] relative">
              <Image
                src={school.coverImage}
                alt={school.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{school.name}</h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{school.rating.score}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>({school.rating.reviewCount})</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <MapPin className="w-4 h-4" />
                {school.district.name}
              </div>
              
              <div className="font-medium text-gray-900">
                от {formatPrice(school.fee.min)} сум
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

---

## 8. TypeScript интерфейсы

```typescript
// types/school.ts

export interface SchoolProfile {
  // Basic
  id: string;
  slug: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  shortDescription: string;
  
  // Type
  type: 'private' | 'international' | 'state_enhanced';
  curriculum: string[];
  accreditations: string[];
  
  // Location
  location: {
    city: string;
    district: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Education
  grades: {
    from: number;
    to: number;
  };
  languages: string[];
  isBilingual: boolean;
  
  // Rating
  rating: {
    score: number;
    reviewCount: number;
    rank: number;
    breakdown: {
      quality: number;
      teachers: number;
      infrastructure: number;
      meals: number;
      communication: number;
    };
  };
  
  // Badges
  badges: {
    isVerified: boolean;
    isPremium: boolean;
    isNew: boolean;
    ranking?: {
      type: 'top1' | 'top3' | 'top10' | 'parents_choice';
      year: number;
    };
    awards: {
      name: string;
      issuer: string;
      year: number;
    }[];
  };
  
  // Pricing
  fee: {
    min: number;
    max?: number;
    currency: 'UZS' | 'USD';
    period: 'month' | 'year';
  };
  
  // Enrollment
  hasOpenEnrollment: boolean;
  enrollmentYear?: string;
  
  // Contacts
  contacts: {
    phones: string[];
    email: string;
    website?: string;
    telegram?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  
  // Stats
  stats: {
    foundedYear: number;
    studentsCount: number;
    teachersCount: number;
    studentTeacherRatio: string;
    classSize: {
      min: number;
      max: number;
    };
  };
  
  // Features
  features: string[];
  
  // Media
  photos: {
    url: string;
    category: string;
    caption?: string;
  }[];
  videos: {
    url: string;
    title: string;
    thumbnail: string;
  }[];
  
  // Documents
  documents: {
    name: string;
    type: 'license' | 'certificate' | 'accreditation';
    issuer: string;
    year: number;
    url: string;
  }[];
  
  // Reviews
  reviews: Review[];
  
  // Program (for Program tab)
  program: {
    curriculum: string;
    description: string;
    stages: {
      name: string;
      grades: string;
      description: string;
    }[];
    subjects: string[];
    extraCurricular: {
      name: string;
      category: string;
    }[];
    examPrep: string[];
    languages: {
      name: string;
      level: string;
    }[];
  };
  
  // Teachers (for Teachers tab)
  teachers: {
    totalCount: number;
    withHigherEducation: number;
    withInternationalCerts: number;
    nativeSpeakers: number;
    foreignTeachers: number;
    averageExperience: number;
    leadership: {
      name: string;
      position: string;
      photo?: string;
      education: string;
      experience: string;
    }[];
  };
  
  // Infrastructure (for Infrastructure tab)
  infrastructure: {
    building: {
      area: number;
      floors: number;
      yearBuilt: number;
      lastRenovation?: number;
    };
    classrooms: {
      total: number;
      withAC: boolean;
      withSmartBoard: boolean;
    };
    facilities: string[];
    sports: string[];
    security: string[];
    it: {
      hasWifi: boolean;
      computersCount: number;
      hasOnlinePortal: boolean;
    };
  };
  
  // Services
  services: {
    transport: {
      available: boolean;
      routes?: string[];
      price?: number;
    };
    meals: {
      available: boolean;
      type: string;
      price?: number;
      menu?: string;
    };
    extendedDay: {
      available: boolean;
      hours?: string;
      price?: number;
    };
    medical: {
      hasNurse: boolean;
      hasPsychologist: boolean;
    };
  };
  
  // Admission (for Admission tab)
  admission: {
    isOpen: boolean;
    deadline?: string;
    requirements: string[];
    documents: string[];
    process: {
      step: number;
      title: string;
      description: string;
    }[];
    hasEntranceExam: boolean;
    examSubjects?: string[];
    contactPerson?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  
  // Pricing details (for Pricing tab)
  pricing: {
    tuition: {
      grades: string;
      monthly: number;
      yearly: number;
      currency: string;
    }[];
    additionalFees: {
      name: string;
      amount: number;
      frequency: string;
    }[];
    discounts: {
      name: string;
      percentage: number;
      conditions: string;
    }[];
    scholarships: {
      name: string;
      description: string;
      coverage: string;
    }[];
    paymentMethods: string[];
    paymentSchedule: string;
  };
  
  // Results
  results: {
    graduates: {
      year: number;
      total: number;
      toUniversities: number;
      toGrants: number;
      abroad: number;
      topUniversities: string[];
    }[];
    exams: {
      name: string;
      averageScore: number;
      year: number;
    }[];
    olympiads: {
      level: 'international' | 'national' | 'regional';
      count: number;
      subjects: string[];
    }[];
  };
}

export interface Review {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    isVerified: boolean;
  };
  rating: number;
  ratings?: {
    quality: number;
    teachers: number;
    infrastructure: number;
    meals: number;
    communication: number;
  };
  date: string;
  content: string;
  pros?: string[];
  cons?: string[];
  helpfulCount: number;
  schoolResponse?: {
    content: string;
    date: string;
  };
}
```

---

## 9. Mobile адаптация

### Breakpoints

| Breakpoint | Поведение |
|------------|-----------|
| Desktop (≥1024px) | 2 колонки: content + sidebar |
| Tablet (768-1023px) | 1 колонка, sidebar под контентом |
| Mobile (<768px) | 1 колонка, tabs в горизонтальном скролле |

### Mobile Hero

```
┌────────────────────────────────────────┐
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                   │  │
│  │          [COVER IMAGE]            │  │
│  │                                   │  │
│  │  [#3]                    [📷 12]  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌────┐ Cambridge School Tashkent      │
│  │LOGO│                                │
│  └────┘ ✓ Верифицирована              │
│                                        │
│  ⭐⭐⭐⭐⭐ 4.8  •  127 отзывов           │
│                                        │
│  📍 Мирзо-Улугбекский район           │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 🎓 Cambridge │ 🗣 Рус/Eng │ 📚 1-11│   │
│  └────────────────────────────────┘   │
│                                        │
│  🏊 🚌 🍽 🔬 🎭                          │
│                                        │
└────────────────────────────────────────┘
```

### Mobile Sticky CTA

```
┌────────────────────────────────────────┐
│                                        │
│  от 3.5 млн /мес     [Записаться 📞]  │
│                                        │
└────────────────────────────────────────┘
Position: fixed bottom, показывается при скролле вниз
```

---

## 10. SEO и метаданные

```typescript
// app/schools/[slug]/page.tsx

import { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = await getSchool(params.slug);
  
  return {
    title: `${school.name} — отзывы, цены, рейтинг | EduMap`,
    description: `${school.name} — ${school.type === 'international' ? 'международная школа' : 'частная школа'} в ${school.location.district}. Рейтинг ${school.rating.score}/5, ${school.rating.reviewCount} отзывов. Программа ${school.curriculum.join(', ')}.`,
    openGraph: {
      title: `${school.name} | EduMap`,
      description: school.shortDescription,
      images: [school.coverImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: school.name,
      description: school.shortDescription,
      images: [school.coverImage],
    },
  };
}

// Structured Data (JSON-LD)
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'School',
  name: school.name,
  description: school.description,
  image: school.coverImage,
  address: {
    '@type': 'PostalAddress',
    streetAddress: school.location.address,
    addressLocality: 'Ташкент',
    addressRegion: school.location.district,
    addressCountry: 'UZ',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: school.location.coordinates.lat,
    longitude: school.location.coordinates.lng,
  },
  telephone: school.contacts.phones[0],
  email: school.contacts.email,
  url: school.contacts.website,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: school.rating.score,
    reviewCount: school.rating.reviewCount,
    bestRating: 5,
    worstRating: 1,
  },
};
```

---

*Версия 1.0 — Декабрь 2024*
