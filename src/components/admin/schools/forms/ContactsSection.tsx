'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, Mail, Globe, MessageCircle, MapPin } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import { YandexMap } from '../YandexMap';

interface PhoneWithComment {
  phone: string;
  comment: string;
}

interface ContactsSectionProps {
  data: {
    phone: string;
    phone2?: PhoneWithComment;
    phone3?: PhoneWithComment;
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
  };
  regions: any[];
  districts: any[];
  loadingDistricts: boolean;
  onDataChange: <K extends keyof ContactsSectionProps['data']>(
    key: K,
    value: ContactsSectionProps['data'][K]
  ) => void;
  onRegionChange: (regionId: number | null) => void;
}

export function ContactsSection({
  data,
  regions,
  districts,
  loadingDistricts,
  onDataChange,
  onRegionChange,
}: ContactsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          2. Aloqa va manzil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:col-span-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Asosiy telefon (kol markaz) *
            </Label>
            <PhoneInput
              id="phone"
              value={data.phone}
              onChange={(value) => onDataChange('phone', value)}
              placeholder="+998901234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone2">Qo'shimcha telefon 1</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <PhoneInput
                value={data.phone2?.phone || ''}
                onChange={(value) =>
                  onDataChange('phone2', {
                    phone: value,
                    comment: data.phone2?.comment || '',
                  })
                }
                placeholder="+998901234567"
              />
              <Input
                placeholder="Izoh (masalan: Qabul)"
                value={data.phone2?.comment || ''}
                onChange={(e) =>
                  onDataChange('phone2', {
                    phone: data.phone2?.phone || '',
                    comment: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone3">Qo'shimcha telefon 2</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <PhoneInput
                value={data.phone3?.phone || ''}
                onChange={(value) =>
                  onDataChange('phone3', {
                    phone: value,
                    comment: data.phone3?.comment || '',
                  })
                }
                placeholder="+998901234567"
              />
              <Input
                placeholder="Izoh (masalan: Direktor)"
                value={data.phone3?.comment || ''}
                onChange={(e) =>
                  onDataChange('phone3', {
                    phone: data.phone3?.phone || '',
                    comment: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onDataChange('email', e.target.value)}
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
              onChange={(e) => onDataChange('website', e.target.value)}
              placeholder="https://school.uz"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Ijtimoiy tarmoqlar
            </Label>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="Telegram (@username)"
                value={data.telegram}
                onChange={(e) => onDataChange('telegram', e.target.value)}
              />
              <Input
                placeholder="Instagram (@username)"
                value={data.instagram}
                onChange={(e) => onDataChange('instagram', e.target.value)}
              />
              <Input
                placeholder="Facebook (username yoki URL)"
                value={data.facebook}
                onChange={(e) => onDataChange('facebook', e.target.value)}
              />
              <Input
                placeholder="YouTube (@username yoki URL)"
                value={data.youtube}
                onChange={(e) => onDataChange('youtube', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Viloyat *
            </Label>
            <Select
              value={data.region_id?.toString() || ''}
              onValueChange={(value) => {
                const regionId = value ? parseInt(value) : null;
                onRegionChange(regionId);
                onDataChange('region_id', regionId);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Viloyatni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id.toString()}>
                    {region.name_uz || region.name}
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
                onDataChange('district_id', value ? parseInt(value) : null)
              }
              disabled={!data.region_id || loadingDistricts}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tumanni tanlang" />
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
              onChange={(e) => onDataChange('address', e.target.value)}
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
              onChange={(e) => onDataChange('landmark', e.target.value)}
              placeholder="Yaqinida..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <YandexMap
              lat={data.lat}
              lng={data.lng}
              address={data.address}
              onCoordinatesChange={(lat, lng) => {
                onDataChange('lat', lat);
                onDataChange('lng', lng);
              }}
              onAddressChange={(address) => {
                onDataChange('address', address);
              }}
              height="400px"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

