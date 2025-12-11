import { LinearClient } from '@linear/sdk';

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
export async function checkLinearConnection(): Promise<boolean> {
  try {
    const client = getLinearClient();
    await client.viewer;
    return true;
  } catch (error) {
    console.error('Ошибка подключения к Linear:', error);
    return false;
  }
}

