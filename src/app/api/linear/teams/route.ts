import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/linear';

/**
 * GET /api/linear/teams
 * Получить список команд в Linear
 */
export async function GET() {
  try {
    const teams = await getTeams();

    return NextResponse.json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('LINEAR_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'LINEAR_API_KEY не найден. См. docs/LINEAR_INTEGRATION.md',
        },
        { status: 500 }
      );
    }

    console.error('Ошибка получения команд из Linear:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка получения команд из Linear',
      },
      { status: 500 }
    );
  }
}

