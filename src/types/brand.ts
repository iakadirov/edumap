/**
 * Тип для бренда школы
 */
export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  founder: string | null;
  description: string | null;
  detailed_description?: string | null;
  founded_year: number | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  telegram?: string | null;
  banner_url?: string | null;
  cover_image_url?: string | null;
  short_description?: string | null;
  created_at: string;
  updated_at: string;
};

