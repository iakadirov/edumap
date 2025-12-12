#!/usr/bin/env tsx
/**
 * Скрипт для проверки статуса пользователя
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

async function main() {
  const email = process.argv[2] || 'iakadirov@edumap.uz';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY должны быть в .env.local\n');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🔍 Проверка статуса пользователя...\n');
  console.log(`📧 Email: ${email}\n`);

  // Проверяем в auth.users (нужен service role key для этого, но попробуем через anon)
  console.log('1️⃣ Проверка в auth.users...');
  // Через anon key мы не можем напрямую читать auth.users, но можем попробовать через API
  
  // Проверяем в users
  console.log('2️⃣ Проверка в таблице users...\n');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (usersError) {
    console.error('❌ Ошибка при запросе users:', usersError);
  } else if (!users || users.length === 0) {
    console.log('⚠️  Пользователь НЕ найден в таблице users\n');
    console.log('📝 Решение:');
    console.log('   1. Получите auth_user_id из Supabase Dashboard → Authentication → Users');
    console.log('   2. Выполните SQL запрос из docs/ADMIN_SETUP.md');
    console.log('   3. Или используйте: npx tsx scripts/create-test-admin.ts YOUR_AUTH_USER_ID\n');
  } else {
    console.log(`✅ Найдено записей: ${users.length}\n`);
    users.forEach((user, index) => {
      console.log(`📋 Запись ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Auth User ID: ${user.auth_user_id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Full Name: ${user.full_name || 'не указано'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Subscription: ${user.subscription_tier}`);
      console.log(`   Is Active: ${user.is_active}`);
      console.log(`   Email Verified: ${user.email_verified}`);
      console.log(`   Created At: ${user.created_at}`);
      console.log('');
    });

    // Проверка проблем
    const user = users[0];
    const issues: string[] = [];

    if (!user.is_active) {
      issues.push('❌ is_active = false (пользователь заблокирован)');
    }
    if (!user.email_verified) {
      issues.push('⚠️  email_verified = false (email не подтвержден)');
    }
    if (!['super_admin', 'admin', 'moderator'].includes(user.role)) {
      issues.push(`⚠️  role = '${user.role}' (не админ роль)`);
    }

    if (issues.length > 0) {
      console.log('⚠️  Обнаружены проблемы:\n');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('\n📝 Решение:');
      console.log('   Выполните SQL запрос для исправления:\n');
      console.log(`   UPDATE users`);
      console.log(`   SET`);
      console.log(`     is_active = true,`);
      console.log(`     role = 'super_admin',`);
      console.log(`     subscription_tier = 'premium',`);
      console.log(`     email_verified = true`);
      console.log(`   WHERE email = '${email}';\n`);
    } else {
      console.log('✅ Все проверки пройдены! Пользователь должен иметь доступ к админ панели.\n');
    }
  }
}

main().catch((error) => {
  console.error('\n❌ Ошибка:', error.message);
  process.exit(1);
});

