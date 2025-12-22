import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { BrandRow } from '@/types/brand';
import { BrandPage } from '@/components/schools/BrandPage';
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  noStore();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: brand } = await supabase
    .from('school_brands')
    .select('name, description, logo_url')
    .eq('slug', slug)
    .single();

  if (!brand) {
    return {
      title: 'Brend topilmadi',
    };
  }

  // Явно указываем тип для результата запроса
  const typedBrandMeta = brand as Pick<BrandRow, 'name' | 'description' | 'logo_url'>;

  return {
    title: `${typedBrandMeta.name} — EduMap.uz`,
    description: typedBrandMeta.description || `${typedBrandMeta.name} brendi maktablari`,
    openGraph: {
      title: `${typedBrandMeta.name} — EduMap.uz`,
      description: typedBrandMeta.description || `${typedBrandMeta.name} brendi maktablari`,
      images: typedBrandMeta.logo_url ? [typedBrandMeta.logo_url] : [],
    },
  };
}

export default async function BrandPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  noStore();
  const { slug } = await params;
  const supabase = await createClient();

  // Получаем бренд
  const { data: brand, error: brandError } = await supabase
    .from('school_brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (brandError || !brand) {
    notFound();
  }

  // Явно указываем тип для результата запроса
  const typedBrandFull = brand as BrandRow;

  // Получаем школы бренда (только опубликованные)
  const { data: schools, error: schoolsError } = await supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('brand_id', typedBrandFull.id)
    .eq('status', 'published')
    .order('name_uz', { ascending: true });

  if (schoolsError) {
    console.error('Error fetching schools:', schoolsError);
  }

  return <BrandPage brand={typedBrandFull} schools={schools || []} />;
}

