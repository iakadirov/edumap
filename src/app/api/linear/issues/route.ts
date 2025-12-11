import { NextResponse } from 'next/server';
import { getAllIssues, getInProgressIssues, getTodoIssues } from '@/lib/linear';

/**
 * GET /api/linear/issues
 * Получить все задачи из Linear
 * 
 * Query параметры:
 *   - status: "all" | "in-progress" | "todo"
 *   - teamId: ID команды (опционально)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const teamId = searchParams.get('teamId') || undefined;

    let issues;

    switch (status) {
      case 'in-progress':
        issues = await getInProgressIssues(teamId);
        break;
      case 'todo':
        issues = await getTodoIssues(teamId);
        break;
      case 'all':
      default:
        issues = await getAllIssues(teamId);
        break;
    }

    return NextResponse.json({
      success: true,
      count: issues.length,
      issues,
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

    console.error('Ошибка получения задач из Linear:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка получения задач из Linear',
      },
      { status: 500 }
    );
  }
}

