#!/usr/bin/env tsx
/**
 * Скрипт для обновления статуса задач в Linear
 * 
 * Использование:
 *   npx tsx scripts/update-linear-status.ts EDU-10 EDU-11
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllIssues, getLinearClient } from '../src/lib/linear';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('\n❌ Ошибка: Не указаны идентификаторы задач\n');
    console.log('Использование:');
    console.log('  npx tsx scripts/update-linear-status.ts EDU-10 EDU-11\n');
    process.exit(1);
  }

  try {
    const client = getLinearClient();
    const allIssues = await getAllIssues();
    
    // Получаем ID статуса "Done"
    const workflowStates = await client.workflowStates();
    const doneState = workflowStates.nodes.find((state: any) => 
      state.type === 'completed' || state.name.toLowerCase() === 'done'
    );
    
    if (!doneState) {
      console.error('❌ Не найден статус "Done"');
      process.exit(1);
    }

    console.log(`\n✅ Обновление статуса задач на "${doneState.name}"...\n`);
    
    for (const identifier of args) {
      const issue = allIssues.find((i) => i.identifier === identifier);
      
      if (!issue) {
        console.log(`⚠️  Задача ${identifier} не найдена`);
        continue;
      }

      if (issue.state.name === doneState.name) {
        console.log(`✅ ${identifier}: уже в статусе "${doneState.name}"`);
        continue;
      }

      try {
        await client.updateIssue(issue.id, {
          stateId: doneState.id,
        });
        console.log(`✅ ${identifier}: обновлена на "${doneState.name}"`);
      } catch (error) {
        console.error(`❌ Ошибка при обновлении ${identifier}:`, error);
      }
    }
    
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  }
}

main().catch(console.error);

