#!/usr/bin/env tsx
/**
 * Скрипт для создания тестового администратора
 * 
 * Использование:
 * 1. Сначала создайте пользователя через Supabase Dashboard → Authentication → Users
 * 2. Скопируйте User UID
 * 3. Запустите: npx tsx scripts/create-test-admin.ts YOUR_AUTH_USER_ID
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

async function main() {
  const authUserId = process.argv[2];

  if (!authUserId) {
    console.error('\n❌ Ошибка: Укажите auth_user_id\n');
    console.log('Использование:');
    console.log('  npx tsx scripts/create-test-admin.ts YOUR_AUTH_USER_ID\n');
    console.log('Как получить auth_user_id:');
    console.log('  1. Откройте Supabase Dashboard');
    console.log('  2. Authentication → Users');
    console.log('  3. Найдите или создайте пользователя');
    console.log('  4. Скопируйте User UID\n');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Ошибка: NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY должны быть в .env.local\n');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n🔍 Проверка пользователя в auth.users...\n');

  // Проверяем, существует ли пользователь в auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(authUserId);

  if (authError || !authUser) {
    console.error('❌ Пользователь не найден в auth.users!');
    console.error('   Сначала создайте пользователя через Supabase Dashboard → Authentication → Users\n');
    process.exit(1);
  }

  console.log(`✅ Пользователь найден: ${authUser.user.email}\n`);

  // Проверяем, существует ли уже в таблице users
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (existingUser) {
    console.log('⚠️  Пользователь уже существует в таблице users:');
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Role: ${existingUser.role}`);
    console.log(`   Active: ${existingUser.is_active}\n`);
    
    // Обновляем до super_admin если нужно
    if (existingUser.role !== 'super_admin' || !existingUser.is_active) {
      console.log('🔄 Обновление до super_admin...\n');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'super_admin',
          subscription_tier: 'premium',
          is_active: true,
          email_verified: true,
        })
        .eq('auth_user_id', authUserId);

      if (updateError) {
        console.error('❌ Ошибка при обновлении:', updateError.message);
        process.exit(1);
      }

      console.log('✅ Пользователь обновлен до super_admin\n');
    } else {
      console.log('✅ Пользователь уже является super_admin\n');
    }
  } else {
    console.log('📝 Создание нового пользователя в таблице users...\n');
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email: authUser.user.email || 'admin@edumap.uz',
        full_name: 'Super Admin',
        role: 'super_admin',
        subscription_tier: 'premium',
        is_active: true,
        email_verified: true,
      });

    if (insertError) {
      console.error('❌ Ошибка при создании пользователя:', insertError.message);
      console.error('   Детали:', insertError);
      process.exit(1);
    }

    console.log('✅ Пользователь успешно создан!\n');
  }

  // Финальная проверка
  const { data: finalUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  console.log('📋 Итоговая информация:');
  console.log(`   ID: ${finalUser?.id}`);
  console.log(`   Email: ${finalUser?.email}`);
  console.log(`   Role: ${finalUser?.role}`);
  console.log(`   Subscription: ${finalUser?.subscription_tier}`);
  console.log(`   Active: ${finalUser?.is_active}`);
  console.log(`   Email Verified: ${finalUser?.email_verified}\n`);
  console.log('────────────────────────────────────────────────────────────────────────────────\n');
  console.log('✅ Готово! Теперь вы можете войти в админ панель:\n');
  console.log('   URL: https://edumap-roan.vercel.app/auth/login');
  console.log(`   Email: ${finalUser?.email}\n`);
}

main().catch((error) => {
  console.error('\n❌ Ошибка:', error.message);
  process.exit(1);
});

