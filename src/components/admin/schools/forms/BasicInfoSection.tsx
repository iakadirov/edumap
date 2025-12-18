'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Building2, School, FileText, Link as LinkIcon } from 'lucide-react';
import { BrandSearch } from '@/components/admin/brands/BrandSearch';
import { SimilarSchoolsSearch } from '../SimilarSchoolsSearch';
import { generateSlug } from '@/lib/utils/slug';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  type: 'logo' | 'cover';
  previewSize: string;
}

interface BasicInfoData {
  name_uz: string;
  school_type: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
}

interface BasicInfoSectionProps {
  data: BasicInfoData;
  brandId: string | null;
  onDataChange: <K extends keyof BasicInfoData>(
    key: K,
    value: BasicInfoData[K]
  ) => void;
  onBrandChange: (brandId: string | null) => void;
  ImageUploadField: React.ComponentType<ImageUploadFieldProps>;
}

export function BasicInfoSection({
  data,
  brandId,
  onDataChange,
  onBrandChange,
  ImageUploadField,
}: BasicInfoSectionProps) {
  const slug = generateSlug(data.name_uz || '');

  return (
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
              onChange={(e) => onDataChange('name_uz', e.target.value)}
              placeholder="Cambridge School Tashkent"
            />
            <SimilarSchoolsSearch query={data.name_uz} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="school_type" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Maktab turi *
            </Label>
            <Select
              value={data.school_type}
              onValueChange={(value) => onDataChange('school_type', value)}
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
              onChange={(e) => onDataChange('description', e.target.value)}
              placeholder="Xalqaro maktab Cambridge dasturi bilan..."
              rows={4}
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground">
              {data.description.length}/200 belgi
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Brend (ixtiyoriy)
            </Label>
            <BrandSearch
              value={brandId}
              onChange={onBrandChange}
            />
          </div>

          {/* Logo and Banner Upload */}
          <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
            <ImageUploadField
              label="Logotip"
              value={data.logo_url}
              onChange={(url) => onDataChange('logo_url', url)}
              type="logo"
              previewSize="w-32 h-32"
            />
            <ImageUploadField
              label="Banner (qopqoq rasm)"
              value={data.banner_url}
              onChange={(url) => onDataChange('banner_url', url)}
              type="cover"
              previewSize="w-full h-48"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

