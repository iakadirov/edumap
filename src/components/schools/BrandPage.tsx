'use client';

import Link from 'next/link';
import { SchoolCard } from './SchoolCard';
import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  BuildingsBold,
  GlobusBold,
  UserBold,
  CalendarBold,
  PhoneCallingBold,
  LetterBold,
  LinkRoundLinear,
} from '@solar-icons/react-perf';
import { formatInstagramForDisplay, formatFacebookForDisplay, formatYouTubeForDisplay } from '@/lib/utils/social-media';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  founder?: string | null;
  description?: string | null;
  founded_year?: number | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}

interface BrandPageProps {
  brand: Brand;
  schools: any[];
}

export function BrandPage({ brand, schools }: BrandPageProps) {
  const instagramData = formatInstagramForDisplay(brand.instagram);
  const facebookData = formatFacebookForDisplay(brand.facebook);
  const youtubeData = formatYouTubeForDisplay(brand.youtube);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {brand.logo_url && (
              <div className="flex-shrink-0 relative w-[120px] h-[120px]">
                <OptimizedImage
                  src={brand.logo_url}
                  alt={brand.name}
                  width={120}
                  height={120}
                  className="rounded-[24px] object-cover border-4 border-background shadow-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{brand.name}</h1>
              {brand.description && (
                <p className="text-lg text-muted-foreground mb-4">{brand.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {brand.founder && (
                  <div className="flex items-center gap-2">
                    <UserBold className="h-4 w-4" />
                    <span>Asoschisi: {brand.founder}</span>
                  </div>
                )}
                {brand.founded_year && (
                  <div className="flex items-center gap-2">
                    <CalendarBold className="h-4 w-4" />
                    <span>{brand.founded_year} yildan</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Schools List */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Maktablar ({schools.length})
              </h2>
              {schools.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BuildingsBold className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Hozircha maktablar qo'shilmagan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schools.map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-[24px] p-6 space-y-6 sticky top-4">
              <h3 className="text-lg font-semibold">Kontaktlar</h3>
              
              {brand.website && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GlobusBold className="h-4 w-4" />
                    Veb-sayt
                  </div>
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    {brand.website}
                    <LinkRoundLinear className="h-3 w-3" />
                  </a>
                </div>
              )}

              {brand.phone && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneCallingBold className="h-4 w-4" />
                    Telefon
                  </div>
                  <a href={`tel:${brand.phone}`} className="text-foreground hover:underline">
                    {brand.phone}
                  </a>
                </div>
              )}

              {brand.email && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LetterBold className="h-4 w-4" />
                    Email
                  </div>
                  <a href={`mailto:${brand.email}`} className="text-foreground hover:underline">
                    {brand.email}
                  </a>
                </div>
              )}

              {/* Social Media */}
              {(instagramData || facebookData || youtubeData) && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Ijtimoiy tarmoqlar</div>
                  <div className="flex flex-wrap gap-2">
                    {instagramData && (
                      <a
                        href={instagramData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                        {instagramData.display}
                      </a>
                    )}
                    {facebookData && (
                      <a
                        href={facebookData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                        {facebookData.display}
                      </a>
                    )}
                    {youtubeData && (
                      <a
                        href={youtubeData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                        </svg>
                        {youtubeData.display}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

