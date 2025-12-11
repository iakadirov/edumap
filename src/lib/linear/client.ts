import { LinearClient } from '@linear/sdk';
import type { LinearConnectionStatus } from './types';

/**
 * Linear API клиент
 * 
 * Использование:
 * const client = getLinearClient();
 * const issues = await client.issues();
 */
let linearClient: LinearClient | null = null;

export function getLinearClient(): LinearClient {
  if (!linearClient) {
    const apiKey = process.env.LINEAR_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        'LINEAR_API_KEY не найден в переменных окружения. ' +
        'Создайте .env.local файл и добавьте LINEAR_API_KEY=your_api_key'
      );
    }
    
    linearClient = new LinearClient({ apiKey });
  }
  
  return linearClient;
}

/**
 * Проверка доступности Linear API
 */
export async function getLinearConnectionStatus(
  includeTeams = false
): Promise<LinearConnectionStatus> {
  try {
    const client = getLinearClient();
    const viewer = await client.viewer;

    const status: LinearConnectionStatus = {
      ok: true,
      viewer: {
        id: viewer.id,
        name: viewer.name,
        email: viewer.email ?? undefined,
      },
    };

    if (includeTeams) {
      const teamsResponse = await client.teams();
      status.teams = teamsResponse.nodes.map((team) => ({
        id: team.id,
        name: team.name,
        key: team.key,
      }));
    }

    return status;
  } catch (error) {
    console.error('Ошибка подключения к Linear:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      ok: false,
      error: message,
    };
  }
}

export async function checkLinearConnection(): Promise<boolean> {
  const status = await getLinearConnectionStatus();
  return status.ok;
}

