/**
 * Скрипт для проверки списка доступных buckets
 */

import { config } from 'dotenv';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

config({ path: '.env.local' });

async function testListBuckets() {
  console.log('🧪 Проверка доступных buckets...\n');

  const accessKeyId = process.env.YANDEX_CLOUD_ACCESS_KEY_ID;
  const secretAccessKey = process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY;
  const endpoint = process.env.YANDEX_CLOUD_ENDPOINT || 'https://storage.yandexcloud.net';
  const region = process.env.YANDEX_CLOUD_REGION || 'ru-central1';

  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ Credentials не настроены');
    process.exit(1);
  }

  const s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ Доступные buckets:');
    if (response.Buckets && response.Buckets.length > 0) {
      response.Buckets.forEach((bucket) => {
        console.log(`   - ${bucket.Name} (создан: ${bucket.CreationDate})`);
      });
    } else {
      console.log('   Нет доступных buckets');
    }
  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
    if (error.$metadata) {
      console.error('   Status:', error.$metadata.httpStatusCode);
      console.error('   Request ID:', error.$metadata.requestId);
    }
  }
}

testListBuckets();

