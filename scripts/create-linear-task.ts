#!/usr/bin/env tsx
/**
 * Скрипт для создания одной задачи в Linear из командной строки
 * 
 * Использование:
 *   npx tsx scripts/create-linear-task.ts "Заголовок задачи" "Описание задачи" [priority]
 * 
 * Примеры:
 *   npx tsx scripts/create-linear-task.ts "[DB] Создать таблицу" "Описание задачи" 3
 *   npx tsx scripts/create-linear-task.ts "[UI] Добавить компонент" "Нужно добавить..."
 * 
 * Требуется:
 *   - LINEAR_API_KEY в .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createIssue, getTeams } from '../src/lib/linear';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('\n❌ Ошибка: Не указан заголовок задачи\n');
    console.log('Использование:');
    console.log('  npx tsx scripts/create-linear-task.ts "Заголовок" "Описание" [priority]');
    console.log('\nПримеры:');
    console.log('  npx tsx scripts/create-linear-task.ts "[DB] Создать таблицу" "Описание..." 3');
    console.log('  npx tsx scripts/create-linear-task.ts "[UI] Компонент" "Нужно..."\n');
    process.exit(1);
  }

  const title = args[0];
  const description = args[1] || '';
  const priority = args[2] ? parseInt(args[2], 10) : 2; // Default: Medium

  if (isNaN(priority) || priority < 0 || priority > 4) {
    console.error('\n❌ Ошибка: Приоритет должен быть от 0 до 4\n');
    console.log('  0 = No priority');
    console.log('  1 = Low');
    console.log('  2 = Medium (по умолчанию)');
    console.log('  3 = High');
    console.log('  4 = Critical\n');
    process.exit(1);
  }

  try {
    console.log('\n📌 Создание задачи в Linear...\n');
    console.log(`Заголовок: ${title}`);
    if (description) {
      console.log(`Описание: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`);
    }
    console.log(`Приоритет: ${priority}\n`);

    // Получаем список команд
    const teams = await getTeams();
    
    if (teams.length === 0) {
      console.error('❌ Команды не найдены в Linear');
      process.exit(1);
    }

    // Используем первую команду (или можно выбрать по ключу)
    const team = teams.find(t => t.key === 'EDU') || teams[0];
    
    console.log(`📁 Команда: ${team.name} (${team.key})\n`);

    // Создаем задачу
    const issue = await createIssue({
      teamId: team.id,
      title: title,
      description: description || undefined,
      priority: priority,
    });

    console.log('─'.repeat(80));
    console.log('\n✅ Задача успешно создана!\n');
    console.log(`Идентификатор: ${issue.identifier}`);
    console.log(`Заголовок: ${issue.title}`);
    console.log(`Статус: ${issue.state.name}`);
    console.log(`URL: ${issue.url}\n`);
    console.log('─'.repeat(80) + '\n');

    // Подсказка для назначения на Cursor
    console.log('💡 Совет: Назначьте задачу на Cursor в Linear для автоматической работы:\n');
    console.log(`   1. Откройте: ${issue.url}`);
    console.log('   2. В поле Assignee выберите "Cursor"\n');

  } catch (error) {
    if (error instanceof Error && error.message.includes('LINEAR_API_KEY')) {
      console.error('\n❌ Ошибка: API ключ Linear не найден\n');
      console.log('📖 Для создания задач через API нужно:');
      console.log('   1. Получить API ключ: Linear → Settings → API → Personal API keys');
      console.log('   2. Создать файл .env.local');
      console.log('   3. Добавить: LINEAR_API_KEY=your_api_key\n');
      process.exit(1);
    }
    
    console.error('\n❌ Ошибка при создании задачи:', error);
    process.exit(1);
  }
}

main().catch(console.error);

