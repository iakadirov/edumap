/**
 * Скрипт для проверки доступа к конкретному bucket
 */

import { config } from 'dotenv';
import { S3Client, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';

config({ path: '.env.local' });

async function testBucketAccess() {
  console.log('🧪 Проверка доступа к bucket...\n');

  const accessKeyId = process.env.YANDEX_CLOUD_ACCESS_KEY_ID;
  const secretAccessKey = process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY;
  const endpoint = process.env.YANDEX_CLOUD_ENDPOINT || 'https://storage.yandexcloud.net';
  const region = process.env.YANDEX_CLOUD_REGION || 'ru-central1';
  const bucketName = process.env.YANDEX_CLOUD_BUCKET_NAME || 'edumap';

  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ Credentials не настроены');
    process.exit(1);
  }

  console.log(`Bucket: ${bucketName}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Region: ${region}\n`);

  // Тест 1: Path-style (forcePathStyle: true)
  console.log('📋 Тест 1: Path-style (forcePathStyle: true)');
  const s3ClientPath = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  try {
    const headCommand = new HeadBucketCommand({ Bucket: bucketName });
    await s3ClientPath.send(headCommand);
    console.log('   ✅ HeadBucket: OK');
    
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `test/path-style-${Date.now()}.txt`,
      Body: 'test content',
    });
    await s3ClientPath.send(putCommand);
    console.log('   ✅ PutObject: OK');
  } catch (error: any) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }

  // Тест 2: Virtual-hosted-style (forcePathStyle: false)
  console.log('\n📋 Тест 2: Virtual-hosted-style (forcePathStyle: false)');
  const s3ClientVirtual = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: false,
  });

  try {
    const headCommand = new HeadBucketCommand({ Bucket: bucketName });
    await s3ClientVirtual.send(headCommand);
    console.log('   ✅ HeadBucket: OK');
    
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: `test/virtual-${Date.now()}.txt`,
      Body: 'test content',
    });
    await s3ClientVirtual.send(putCommand);
    console.log('   ✅ PutObject: OK');
  } catch (error: any) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }
}

testBucketAccess();

