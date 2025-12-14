import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/regions
 * Получить список всех регионов
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: regions, error } = await (supabase as any)
      .from('regions')
      .select('id, name_uz, name_ru')
      .order('name_uz');

    if (error) {
      console.error('Error fetching regions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch regions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ regions: regions || [] });
  } catch (error) {
    console.error('Error in GET /api/regions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
