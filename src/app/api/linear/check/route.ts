import { NextResponse } from 'next/server';
import { getLinearConnectionStatus } from '@/lib/linear';

/**
 * GET /api/linear/check
 * Проверка подключения к Linear API
 */
export async function GET() {
  const status = await getLinearConnectionStatus(true);

  if (!status.ok) {
    const message = status.error || 'Ошибка проверки интеграции Linear';

    if (message.includes('LINEAR_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'LINEAR_API_KEY не найден. См. docs/LINEAR_INTEGRATION.md',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    viewer: status.viewer,
    teams: status.teams || [],
  });
}
