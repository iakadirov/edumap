/**
 * Тип для организации (школы)
 */
export type OrganizationRow = {
  id: string;
  org_type: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  slug: string;
  description: string | null;
  detailed_description?: string | null;
  short_description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  banner_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  region: string | null;
  region_id: number | null;
  district_id: number | null;
  landmark: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  is_verified: boolean;
  overall_rating: number | null;
  reviews_count: number;
  brand_id: string | null;
  parent_organization_id: string | null;
  admin_user_id: string | null;
  created_at: string;
  updated_at: string;
  // Дополнительные поля
  telegram?: string | null;
  telegram_channel?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  google_maps_url?: string | null;
  yandex_maps_url?: string | null;
  founded_year?: number | null;
  motto?: string | null;
  phone_secondary?: string | null;
  phone_secondary_comment?: string | null;
  phone_admission?: string | null;
  phone_admission_comment?: string | null;
  email_admission?: string | null;
};

