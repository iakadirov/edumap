import { NextRequest, NextResponse } from 'next/server';
import { getDistrictsWithCounts } from '@/lib/supabase/queries';

/**
 * API endpoint для получения районов
 * GET /api/districts?region=11
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regionIdParam = searchParams.get('region');
    
    const regionId = regionIdParam ? parseInt(regionIdParam, 10) : null;
    
    if (regionIdParam && isNaN(regionId as number)) {
      return NextResponse.json(
        { error: 'Invalid region ID' },
        { status: 400 }
      );
    }

    const districts = await getDistrictsWithCounts(regionId);
    
    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

