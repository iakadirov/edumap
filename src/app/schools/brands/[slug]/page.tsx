import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
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

  return {
    title: `${brand.name} — EduMap.uz`,
    description: brand.description || `${brand.name} brendi maktablari`,
    openGraph: {
      title: `${brand.name} — EduMap.uz`,
      description: brand.description || `${brand.name} brendi maktablari`,
      images: brand.logo_url ? [brand.logo_url] : [],
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

  // Получаем школы бренда (только опубликованные)
  const { data: schools, error: schoolsError } = await supabase
    .from('organizations')
    .select(`
      *,
      school_details (*)
    `)
    .eq('brand_id', brand.id)
    .eq('status', 'published')
    .order('name_uz', { ascending: true });

  if (schoolsError) {
    console.error('Error fetching schools:', schoolsError);
  }

  return <BrandPage brand={brand} schools={schools || []} />;
}

