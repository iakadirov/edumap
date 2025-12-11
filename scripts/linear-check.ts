#!/usr/bin/env tsx
/**
 * Быстрая проверка интеграции с Linear API
 *
 * Использование:
 *   npx tsx scripts/linear-check.ts
 *   npm run linear:check
 */

import { getLinearConnectionStatus } from '../src/lib/linear';

async function main() {
  const status = await getLinearConnectionStatus(true);

  if (!status.ok) {
    const message = status.error || 'Неизвестная ошибка';

    if (message.includes('LINEAR_API_KEY')) {
      console.error('❌ LINEAR_API_KEY не найден. См. docs/LINEAR_INTEGRATION.md');
    } else {
      console.error('❌ Ошибка подключения к Linear:', message);
    }
    process.exit(1);
  }

  console.log('\n✅ Успешное подключение к Linear API\n');

  if (status.viewer) {
    console.log('🙋 Авторизованы как:');
    console.log(`   ${status.viewer.name} (${status.viewer.email || 'без email'})`);
  }

  if (status.teams && status.teams.length > 0) {
    console.log('\n👥 Доступные команды:');
    status.teams.forEach((team) => {
      console.log(`   • ${team.name} (${team.key}) — ${team.id}`);
    });
  }

  console.log('\nГотово! Можно работать с задачами из Linear.\n');
}

main().catch((error) => {
  console.error('❌ Непредвиденная ошибка:', error);
  process.exit(1);
});
