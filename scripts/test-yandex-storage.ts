/**
 * Скрипт для проверки подключения к Yandex Cloud Storage
 * 
 * Использование:
 * npm run test:storage
 * или
 * tsx scripts/test-yandex-storage.ts
 */

import { config } from 'dotenv';
import { uploadFile, getFileUrl, deleteFile, fileExists } from '../src/lib/storage';

// Загрузка переменных окружения
config({ path: '.env.local' });

async function testYandexStorage() {
  console.log('🧪 Тестирование подключения к Yandex Cloud Storage...\n');

  // Проверка переменных окружения
  const requiredEnvVars = [
    'YANDEX_CLOUD_ACCESS_KEY_ID',
    'YANDEX_CLOUD_SECRET_ACCESS_KEY',
    'YANDEX_CLOUD_BUCKET_NAME',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('❌ Отсутствуют переменные окружения:');
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    console.error('\nДобавьте их в .env.local файл');
    process.exit(1);
  }

  console.log('✅ Переменные окружения настроены');
  console.log(`   Bucket: ${process.env.YANDEX_CLOUD_BUCKET_NAME}`);
  console.log(`   Region: ${process.env.YANDEX_CLOUD_REGION || 'ru-central1'}\n`);

  // Тест 1: Загрузка тестового файла
  console.log('📤 Тест 1: Загрузка тестового файла...');
  try {
    const testKey = `test/connection-test-${Date.now()}.txt`;
    const testContent = `Test file uploaded at ${new Date().toISOString()}`;

    await uploadFile({
      key: testKey,
      file: Buffer.from(testContent),
      contentType: 'text/plain',
      metadata: {
        test: 'true',
      },
    });

    console.log(`   ✅ Файл загружен: ${testKey}`);

    // Тест 2: Проверка существования файла
    console.log('🔍 Тест 2: Проверка существования файла...');
    const exists = await fileExists(testKey);
    if (exists) {
      console.log('   ✅ Файл существует');
    } else {
      console.log('   ❌ Файл не найден');
    }

    // Тест 3: Получение URL
    console.log('🔗 Тест 3: Получение presigned URL...');
    const url = await getFileUrl(testKey, 3600);
    console.log(`   ✅ URL получен: ${url.substring(0, 80)}...`);

    // Тест 4: Удаление тестового файла
    console.log('🗑️  Тест 4: Удаление тестового файла...');
    await deleteFile(testKey);
    console.log('   ✅ Файл удален');

    console.log('\n✅ Все тесты пройдены успешно!');
    console.log('🎉 Yandex Cloud Storage настроен правильно.\n');
  } catch (error: any) {
    console.error('\n❌ Ошибка при тестировании:');
    console.error(error.message);
    
    if (error.message.includes('InvalidAccessKeyId') || error.message.includes('SignatureDoesNotMatch')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Неправильный Access Key ID или Secret Access Key');
      console.error('   - Проверьте правильность ключей в .env.local');
    } else if (error.message.includes('NoSuchBucket')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Bucket не существует или имя указано неправильно');
      console.error('   - Проверьте имя bucket в .env.local');
    } else if (error.message.includes('AccessDenied')) {
      console.error('\n💡 Возможные причины:');
      console.error('   - Сервисный аккаунт не имеет прав на доступ к bucket');
      console.error('   - Проверьте роль сервисного аккаунта (должна быть storage.editor)');
    }
    
    process.exit(1);
  }
}

testYandexStorage();

