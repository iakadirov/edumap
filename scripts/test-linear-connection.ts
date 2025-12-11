#!/usr/bin/env tsx
/**
 * Скрипт для проверки подключения к Linear API
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { checkLinearConnection, getLinearClient } from '../src/lib/linear';

async function main() {
  try {
    console.log('\n🔍 Проверка подключения к Linear API...\n');
    
    // Проверяем наличие ключа
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      console.error('❌ Ошибка: LINEAR_API_KEY не найден в .env.local\n');
      console.log('📖 Инструкция:');
      console.log('   1. Откройте: https://linear.app/settings/api');
      console.log('   2. Создайте новый API ключ');
      console.log('   3. Добавьте в .env.local: LINEAR_API_KEY=lin_api_...\n');
      process.exit(1);
    }
    
    // Показываем первые/последние символы ключа для проверки
    const keyPreview = apiKey.length > 20 
      ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
      : '***';
    console.log(`✅ API ключ найден: ${keyPreview}`);
    
    if (!apiKey.startsWith('lin_api_')) {
      console.warn('\n⚠️  Внимание: API ключ должен начинаться с "lin_api_"');
      console.warn('   Возможно, ключ указан неправильно.\n');
    }
    
    console.log('\n🔌 Проверка подключения...\n');
    
    // Проверяем подключение
    const client = getLinearClient();
    const viewer = await client.viewer;
    
    console.log('✅ Подключение успешно!\n');
    console.log(`👤 Пользователь: ${viewer.name || viewer.email || 'Не указано'}`);
    console.log(`📧 Email: ${viewer.email || 'Не указано'}\n`);
    
    // Получаем команды
    console.log('📁 Получение списка команд...\n');
    const teams = await client.teams();
    
    if (teams.nodes.length === 0) {
      console.log('⚠️  Команды не найдены в вашем workspace\n');
    } else {
      console.log(`✅ Найдено команд: ${teams.nodes.length}\n`);
      teams.nodes.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.key}: ${team.name} (ID: ${team.id})`);
      });
      console.log('');
    }
    
    console.log('─'.repeat(80));
    console.log('\n✅ Всё готово! Linear API работает корректно.\n');
    
  } catch (error: any) {
    console.error('\n❌ Ошибка подключения к Linear:\n');
    
    if (error.type === 'AuthenticationError') {
      console.error('   Ошибка аутентификации. Возможные причины:');
      console.error('   1. API ключ неверный или истек');
      console.error('   2. API ключ был удален в Linear');
      console.error('   3. API ключ не имеет нужных прав доступа\n');
      console.log('📖 Решение:');
      console.log('   1. Откройте: https://linear.app/settings/api');
      console.log('   2. Создайте новый Personal API Key');
      console.log('   3. Скопируйте ключ полностью (начинается с lin_api_)');
      console.log('   4. Обновите .env.local: LINEAR_API_KEY=ваш_новый_ключ\n');
    } else {
      console.error('   ', error.message || error);
      console.error('\n   Полная ошибка:', error);
    }
    
    process.exit(1);
  }
}

main().catch(console.error);

