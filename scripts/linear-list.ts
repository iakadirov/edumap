#!/usr/bin/env tsx
/**
 * Скрипт для получения списка задач из Linear
 * 
 * Использование:
 *   npx tsx scripts/linear-list.ts
 *   npx tsx scripts/linear-list.ts --team EDU
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllIssues, getTeams } from '../src/lib/linear';

async function main() {
  const args = process.argv.slice(2);
  const teamFlag = args.find((arg) => arg.startsWith('--team'));
  let teamId: string | undefined;

  if (teamFlag) {
    const teamKey = teamFlag.split('=')[1];
    const teams = await getTeams();
    const team = teams.find((t) => t.key === teamKey);
    
    if (team) {
      teamId = team.id;
      console.log(`\n📁 Команда: ${team.name} (${team.key})\n`);
    } else {
      console.error(`❌ Команда с ключом "${teamKey}" не найдена`);
      console.log(`\nДоступные команды:`);
      teams.forEach((t) => console.log(`  - ${t.key}: ${t.name}`));
      process.exit(1);
    }
  }

  try {
    const issues = await getAllIssues(teamId);
    
    if (issues.length === 0) {
      console.log('📭 Нет задач в Linear\n');
      return;
    }

    console.log(`📋 Найдено задач: ${issues.length}\n`);
    console.log('─'.repeat(80));

    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.identifier}: ${issue.title}`);
      console.log(`   Статус: ${issue.state.name}`);
      
      if (issue.assignee) {
        console.log(`   Исполнитель: ${issue.assignee.name}`);
      }
      
      if (issue.priority > 0) {
        const priorityLabels = ['', 'Low', 'Medium', 'High', 'Critical'];
        console.log(`   Приоритет: ${priorityLabels[issue.priority] || issue.priority}`);
      }
      
      if (issue.labels && issue.labels.nodes.length > 0) {
        const labels = issue.labels.nodes.map((l) => l.name).join(', ');
        console.log(`   Метки: ${labels}`);
      }
      
      console.log(`   URL: ${issue.url}`);
    });

    console.log('\n' + '─'.repeat(80) + '\n');
  } catch (error) {
    if (error instanceof Error && error.message.includes('LINEAR_API_KEY')) {
      console.error('❌ Ошибка: API ключ Linear не найден');
      console.log('\n📖 Инструкция:');
      console.log('   1. Создайте файл .env.local');
      console.log('   2. Добавьте: LINEAR_API_KEY=your_api_key');
      console.log('   3. Получите ключ: Linear → Settings → API → Personal API keys\n');
      process.exit(1);
    }
    
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

