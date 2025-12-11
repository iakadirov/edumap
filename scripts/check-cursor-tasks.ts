#!/usr/bin/env tsx
/**
 * Скрипт для проверки задач, назначенных на Cursor
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllIssues, getTeams } from '../src/lib/linear';

async function main() {
  try {
    console.log('\n🔍 Проверка задач, назначенных на Cursor...\n');
    
    // Получаем все задачи
    const issues = await getAllIssues();
    
    if (issues.length === 0) {
      console.log('📭 Нет задач в Linear\n');
      return;
    }

    // Ищем задачи, назначенные на Cursor
    // Cursor может быть назначен как assignee с именем "Cursor" или через интеграцию
    const cursorTasks = issues.filter((issue) => {
      const assigneeName = issue.assignee?.name?.toLowerCase() || '';
      return assigneeName.includes('cursor') || 
             issue.title.toLowerCase().includes('cursor') ||
             issue.description?.toLowerCase().includes('cursor');
    });

    if (cursorTasks.length > 0) {
      console.log(`✅ Найдено задач для Cursor: ${cursorTasks.length}\n`);
      console.log('─'.repeat(80));
      
      cursorTasks.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.identifier}: ${issue.title}`);
        console.log(`   Статус: ${issue.state.name}`);
        
        if (issue.assignee) {
          console.log(`   Исполнитель: ${issue.assignee.name} (${issue.assignee.email})`);
        }
        
        if (issue.description) {
          const desc = issue.description.substring(0, 150);
          console.log(`   Описание: ${desc}${issue.description.length > 150 ? '...' : ''}`);
        }
        
        if (issue.priority > 0) {
          const priorityLabels = ['', 'Low', 'Medium', 'High', 'Critical'];
          console.log(`   Приоритет: ${priorityLabels[issue.priority] || issue.priority}`);
        }
        
        console.log(`   URL: ${issue.url}`);
      });
      
      console.log('\n' + '─'.repeat(80) + '\n');
    } else {
      console.log('⚠️  Не найдено задач, явно назначенных на Cursor\n');
      console.log('📋 Все задачи в Linear:\n');
      console.log('─'.repeat(80));
      
      issues.slice(0, 10).forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.identifier}: ${issue.title}`);
        console.log(`   Статус: ${issue.state.name}`);
        if (issue.assignee) {
          console.log(`   Исполнитель: ${issue.assignee.name}`);
        } else {
          console.log(`   Исполнитель: не назначен`);
        }
        console.log(`   URL: ${issue.url}`);
      });
      
      if (issues.length > 10) {
        console.log(`\n... и ещё ${issues.length - 10} задач`);
      }
      
      console.log('\n' + '─'.repeat(80));
      console.log('\n💡 Совет: Убедитесь, что задача назначена на "Cursor" в поле Assignee');
      console.log('   или содержит "cursor" в названии/описании\n');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('LINEAR_API_KEY')) {
      console.error('\n❌ Ошибка: API ключ Linear не найден\n');
      console.log('📖 Для проверки задач через API нужно:');
      console.log('   1. Получить API ключ: Linear → Settings → API → Personal API keys');
      console.log('   2. Создать файл .env.local');
      console.log('   3. Добавить: LINEAR_API_KEY=your_api_key\n');
      console.log('💡 Но для официальной интеграции Cursor ↔ Linear API ключ НЕ нужен!');
      console.log('   Просто назначьте задачу на Cursor в Linear, и Cursor автоматически начнет работу.\n');
      process.exit(1);
    }
    
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

