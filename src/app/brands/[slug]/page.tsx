import { redirect } from 'next/navigation';

/**
 * Редирект со старого роута /brands/[slug] на новый /schools/brands/[slug]
 */
export default async function BrandPageRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/schools/brands/${slug}`);
}

