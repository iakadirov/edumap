import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSchoolWithBranches } from '@/lib/supabase/queries';
import { transformSchoolToProfile } from '@/lib/utils/school-transform';
import { SchoolHero } from '@/components/schools/SchoolHero';
import { SchoolProfileLayout } from '@/components/schools/SchoolProfileLayout';
import { SimilarSchools } from '@/components/schools/SimilarSchools';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Кэширование на 300 секунд (5 минут) для страниц школ
export const revalidate = 300;

interface SchoolProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Генерация метаданных для SEO
 */
export async function generateMetadata({
  params,
}: SchoolProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const branchesData = await getSchoolWithBranches(slug);
    const school = branchesData.current;
    const schoolProfile = transformSchoolToProfile(school);
    
    return {
      title: `${schoolProfile.name} — отзывы, цены, рейтинг | EduMap`,
      description:
        `${schoolProfile.name} — ${schoolProfile.type === 'international' ? 'международная школа' : 'частная школа'} в ${schoolProfile.location.district}. Рейтинг ${(schoolProfile.rating.score).toFixed(1)}/5, ${schoolProfile.rating.reviewCount} отзывов. Программа ${schoolProfile.curriculum.join(', ')}.`,
      openGraph: {
        title: `${schoolProfile.name} | EduMap`,
        description: schoolProfile.shortDescription || schoolProfile.description,
        images: [schoolProfile.coverImage],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: schoolProfile.name,
        description: schoolProfile.shortDescription || schoolProfile.description,
        images: [schoolProfile.coverImage],
      },
    };
  } catch {
    return {
      title: 'Школа не найдена | EduMap',
    };
  }
}

/**
 * Страница профиля школы
 * 
 * Полная переработка согласно дизайн-документации
 * Включает HERO, SIDEBAR, табы и похожие школы
 */
export default async function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  const { slug } = await params;
  let school: Awaited<ReturnType<typeof getSchoolWithBranches>>['current'] | null;
  let branchesData: Awaited<ReturnType<typeof getSchoolWithBranches>> | null = null;
  let error: Error | null = null;

  try {
    // Получаем школу с филиалами
    branchesData = await getSchoolWithBranches(slug);
    school = branchesData.current;
  } catch (e) {
    error = e instanceof Error ? e : new Error('Ошибка загрузки школы');
    school = null;
  }

  // Школа не найдена
  if (!school || error) {
    notFound();
  }

  // Преобразуем данные в формат SchoolProfile
  const schoolProfile = transformSchoolToProfile(school);
  
  const branches = branchesData?.branches || [];
  const isBranch = !!school.parent_organization_id;

  // Structured Data (JSON-LD) для SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: schoolProfile.name,
    description: schoolProfile.description,
    image: schoolProfile.coverImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: schoolProfile.location.address,
      addressLocality: schoolProfile.location.city,
      addressRegion: schoolProfile.location.district,
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: schoolProfile.location.coordinates.lat,
      longitude: schoolProfile.location.coordinates.lng,
    },
    telephone: schoolProfile.contacts.phones[0],
    email: schoolProfile.contacts.email,
    url: schoolProfile.contacts.website,
    aggregateRating: schoolProfile.rating.reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: schoolProfile.rating.score,
          reviewCount: schoolProfile.rating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gray-50">
      <div className="container-wrapper py-8">
        <div className="container-content" data-school-page>
          <div className="container-inner">
              {/* Breadcrumbs */}
          <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/schools/list">← Katalogga qaytish</Link>
        </Button>
      </div>

      {/* Информация о филиале/главной школе */}
      {isBranch && branchesData?.main && (
        <div className="mb-4 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Tarmoq filiali:{' '}
            <Link
              href={`/schools/${branchesData.main.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {branchesData.main.name}
            </Link>
          </p>
        </div>
      )}

              {/* HERO Section */}
              <SchoolHero school={schoolProfile} />

              {/* Main Content with Tabs and Sidebar */}
              <SchoolProfileLayout school={schoolProfile} />

              {/* Similar Schools */}
              <SimilarSchools currentSchool={schoolProfile} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
