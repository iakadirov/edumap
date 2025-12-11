#!/usr/bin/env tsx
/**
 * Скрипт для получения задач в статусе "Todo" (готовых к работе)
 * 
 * Использование:
 *   npx tsx scripts/linear-todo.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getTodoIssues, getTeams } from '../src/lib/linear';

async function main() {
  try {
    const issues = await getTodoIssues();
    
    if (issues.length === 0) {
      console.log('✅ Нет задач в статусе "Todo". Все задачи в работе! 🎉\n');
      return;
    }

    // Группируем по приоритету
    const byPriority = issues.reduce((acc, issue) => {
      const priority = issue.priority || 0;
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(issue);
      return acc;
    }, {} as Record<number, typeof issues>);

    const priorityOrder = [4, 3, 2, 1, 0]; // Critical → Low
    const priorityLabels = ['', 'Low', 'Medium', 'High', 'Critical'];

    console.log(`\n📋 Задач готовых к работе: ${issues.length}\n`);
    console.log('─'.repeat(80));

    for (const priority of priorityOrder) {
      if (!byPriority[priority]) continue;

      const label = priorityLabels[priority] || 'No priority';
      console.log(`\n🔸 ${label} (${byPriority[priority].length}):`);

      byPriority[priority].forEach((issue) => {
        console.log(`\n  ${issue.identifier}: ${issue.title}`);
        
        if (issue.description) {
          const desc = issue.description.substring(0, 100);
          console.log(`     ${desc}${issue.description.length > 100 ? '...' : ''}`);
        }
        
        if (issue.labels && issue.labels.nodes.length > 0) {
          const labels = issue.labels.nodes.map((l) => l.name).join(', ');
          console.log(`     🏷️  ${labels}`);
        }
        
        console.log(`     🔗 ${issue.url}`);
      });
    }

    console.log('\n' + '─'.repeat(80) + '\n');
    console.log('💡 Совет: Скопируйте описание задачи и отправьте в чат с Claude\n');
  } catch (error) {
    if (error instanceof Error && error.message.includes('LINEAR_API_KEY')) {
      console.error('❌ Ошибка: API ключ Linear не найден');
      console.log('\n📖 См. инструкцию: docs/LINEAR_INTEGRATION.md\n');
      process.exit(1);
    }
    
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

