/**
 * Сервис для работы со школами
 * Централизованная бизнес-логика
 */

import { createClient } from '@/lib/supabase/server';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { normalizePhone } from '@/lib/utils/phone';
import { normalizeWebsite } from '@/lib/utils/website';
import { saveTelegram } from '@/lib/utils/telegram';
import { saveInstagram, saveFacebook, saveYouTube } from '@/lib/utils/social-media';
import type { OrganizationRow } from '@/types/organization';

type Organization = OrganizationRow;

// Тип для school_details
type SchoolDetails = {
  id: string;
  organization_id: string;
  school_type: string;
  grade_from: number;
  grade_to: number;
  primary_language: string;
  accepts_preparatory: boolean;
  accepted_grades: number[] | null;
  additional_languages: string[] | null;
  curriculum: string[] | null;
  fee_monthly_min: number | null;
  fee_monthly_max: number | null;
  pricing_tiers: unknown | null;
  [key: string]: unknown;
};

export interface CreateSchoolDTO {
  organization: {
    name: string;
    name_uz?: string | null;
    name_ru?: string | null;
    description?: string | null;
    status?: string;
    phone?: string | null;
    phone_secondary?: string | null;
    phone_secondary_comment?: string | null;
    phone_admission?: string | null;
    phone_admission_comment?: string | null;
    email?: string | null;
    website?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    region_id?: number | null;
    district_id?: number | null;
    address?: string | null;
    landmark?: string | null;
    lat?: number | null;
    lng?: number | null;
    logo_url?: string | null;
    banner_url?: string | null;
    brand_id?: string | null;
    admin_user_id?: string | null;
  };
  school_details: {
    school_type: string;
    grade_from?: number;
    grade_to?: number;
    accepts_preparatory?: boolean;
    accepted_grades?: number[] | null;
    primary_language?: string;
    additional_languages?: string[] | null;
    curriculum?: string[] | null;
    fee_monthly_min?: number | null;
    fee_monthly_max?: number | null;
    pricing_tiers?: Array<{ grades: number[]; price: number | null }> | null;
  };
}

export interface SchoolWithDetails extends Organization {
  school_details: SchoolDetails | SchoolDetails[] | null;
}

/**
 * Получить детали школы (нормализует массив к объекту)
 */
export function getSchoolDetails(school: SchoolWithDetails): SchoolDetails | null {
  if (!school.school_details) return null;
  return Array.isArray(school.school_details)
    ? school.school_details[0] ?? null
    : school.school_details;
}

/**
 * Нормализация данных организации перед сохранением
 */
function normalizeOrganizationData(data: CreateSchoolDTO['organization']) {
  return {
    ...data,
    phone: data.phone ? normalizePhone(data.phone) : null,
    phone_secondary: data.phone_secondary ? normalizePhone(data.phone_secondary) : null,
    phone_admission: data.phone_admission ? normalizePhone(data.phone_admission) : null,
    website: data.website ? normalizeWebsite(data.website) : null,
    telegram: data.telegram ? saveTelegram(data.telegram) : null,
    instagram: data.instagram ? saveInstagram(data.instagram) : null,
    facebook: data.facebook ? saveFacebook(data.facebook) : null,
    youtube: data.youtube ? saveYouTube(data.youtube) : null,
  };
}

export class SchoolService {
  /**
   * Создать школу с деталями
   * Примечание: после применения миграции 041 можно использовать RPC для транзакций
   */
  static async create(dto: CreateSchoolDTO): Promise<{ id: string; slug: string }> {
    const supabase = await createClient();

    // Генерируем уникальный slug
    const baseSlug = generateSlug(dto.organization.name_uz || dto.organization.name || 'school');
    const { data: existingSlugs } = await supabase
      .from('organizations')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    // Явно указываем тип для результата запроса
    const typedExistingSlugs = (existingSlugs || []) as Pick<OrganizationRow, 'slug'>[];
    const slugs = typedExistingSlugs.map((s) => s.slug).filter((s): s is string => s !== null);
    const slug = generateUniqueSlug(baseSlug, slugs);

    // Нормализуем данные
    const normalizedOrg = normalizeOrganizationData(dto.organization);

    // Создаем организацию
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        ...normalizedOrg,
        org_type: 'school',
        slug,
        status: dto.organization.status || 'published',
      })
      .select()
      .single();

    if (orgError || !newOrg) {
      console.error('Error creating organization:', orgError);
      throw new Error(`Failed to create organization: ${orgError?.message || 'Unknown error'}`);
    }

    // Явно указываем тип для результата запроса
    const typedNewOrg = newOrg as Organization;

    // Создаем детали школы
    const { error: detailsError } = await supabase
      .from('school_details')
      .insert({
        organization_id: typedNewOrg.id,
        school_type: dto.school_details.school_type as 'private' | 'state' | 'international',
        grade_from: dto.school_details.grade_from ?? 1,
        grade_to: dto.school_details.grade_to ?? 11,
        primary_language: (dto.school_details.primary_language || 'uzbek') as 'uzbek' | 'russian' | 'english',
        accepts_preparatory: dto.school_details.accepts_preparatory ?? false,
        accepted_grades: dto.school_details.accepted_grades,
        additional_languages: dto.school_details.additional_languages,
        curriculum: dto.school_details.curriculum,
        fee_monthly_min: dto.school_details.fee_monthly_min,
        fee_monthly_max: dto.school_details.fee_monthly_max,
        pricing_tiers: dto.school_details.pricing_tiers,
      });

    if (detailsError) {
      // Откатываем создание организации
      await supabase.from('organizations').delete().eq('id', typedNewOrg.id);
      console.error('Error creating school details:', detailsError);
      throw new Error(`Failed to create school details: ${detailsError.message}`);
    }

    return { id: typedNewOrg.id, slug: typedNewOrg.slug };
  }

  /**
   * Обновить школу с деталями
   * Примечание: после применения миграции 041 можно использовать RPC для транзакций
   */
  static async update(
    schoolId: string,
    dto: Partial<CreateSchoolDTO>
  ): Promise<{ id: string }> {
    const supabase = await createClient();

    // Обновляем организацию если есть данные
    if (dto.organization) {
      const normalizedOrg = normalizeOrganizationData(dto.organization);
      const { error: orgError } = await supabase
        .from('organizations')
        .update(normalizedOrg)
        .eq('id', schoolId);

      if (orgError) {
        console.error('Error updating organization:', orgError);
        throw new Error(`Failed to update organization: ${orgError.message}`);
      }
    }

    // Обновляем детали школы если есть данные
    if (dto.school_details) {
      const { error: detailsError } = await supabase
        .from('school_details')
        .update(dto.school_details)
        .eq('organization_id', schoolId);

      if (detailsError) {
        console.error('Error updating school details:', detailsError);
        throw new Error(`Failed to update school details: ${detailsError.message}`);
      }
    }

    return { id: schoolId };
  }

  /**
   * Получить школу по ID
   */
  static async getById(id: string): Promise<SchoolWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('organizations')
      .select(`*, school_details(*)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as SchoolWithDetails;
  }

  /**
   * Получить школу по slug
   */
  static async getBySlug(slug: string): Promise<SchoolWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('organizations')
      .select(`*, school_details(*)`)
      .eq('slug', slug)
      .eq('org_type', 'school')
      .in('status', ['active', 'published'])
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as SchoolWithDetails;
  }

  /**
   * Удалить школу
   */
  static async delete(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete school: ${error.message}`);
    }
  }

  /**
   * Проверить уникальность slug
   */
  static async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const supabase = await createClient();

    let query = supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query.single();
    return !data;
  }

  /**
   * Получить все существующие slugs (для генерации уникального)
   */
  static async getAllSlugs(): Promise<string[]> {
    const supabase = await createClient();

    const { data } = await supabase
      .from('organizations')
      .select('slug')
      .eq('org_type', 'school');

    // Явно указываем тип для результата запроса
    const typedData = (data || []) as Pick<OrganizationRow, 'slug'>[];
    return typedData.map((s) => s.slug).filter((s): s is string => s !== null);
  }
}
