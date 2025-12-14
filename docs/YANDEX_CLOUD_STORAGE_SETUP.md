# Настройка Yandex Cloud Storage для EduMap

## Обзор

Yandex Cloud Object Storage используется для хранения всех медиафайлов проекта:
- Логотипы организаций
- Галерея организаций (фото)
- Документы лицензий
- Другие медиафайлы

---

## Шаг 1: Создание Bucket в Yandex Cloud

### 1.1 Вход в Yandex Cloud Console

1. Откройте https://console.cloud.yandex.ru
2. Войдите в свой аккаунт
3. Выберите нужный каталог (folder) или создайте новый

### 1.2 Создание Bucket

1. Перейдите в раздел **Object Storage**
2. Нажмите **Создать bucket**
3. Заполните параметры:
   - **Имя bucket**: `edumap-media` (или другое уникальное имя)
   - **Тип доступа**: 
     - Для начала: **Приватный** (Private)
     - Позже можно настроить публичный доступ для определенных папок
   - **Регион**: Выберите ближайший регион (например, `ru-central1`)
   - **Класс хранилища**: `Standard` (по умолчанию)
   - **Версионирование**: Отключено (можно включить позже)
   - **Шифрование**: По желанию

4. Нажмите **Создать bucket**

### 1.3 Настройка CORS (для веб-загрузки)

1. Откройте созданный bucket
2. Перейдите в **CORS**
3. Добавьте правило:
   ```json
   {
     "AllowedOrigins": ["*"],
     "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
     "AllowedHeaders": ["*"],
     "ExposeHeaders": ["ETag"],
     "MaxAgeSeconds": 3600
   }
   ```
   ⚠️ **Важно**: Для production замените `"*"` на конкретные домены (например, `["https://edumap.uz", "https://www.edumap.uz"]`)

---

## Шаг 2: Создание сервисного аккаунта

### 2.1 Создание сервисного аккаунта

1. Перейдите в раздел **IAM** → **Сервисные аккаунты**
2. Нажмите **Создать сервисный аккаунт**
3. Заполните:
   - **Имя**: `edumap-storage-service`
   - **Описание**: `Service account for EduMap file storage`
4. Нажмите **Создать**

### 2.2 Назначение ролей

1. Откройте созданный сервисный аккаунт
2. Перейдите на вкладку **Роли**
3. Нажмите **Назначить роли**
4. Выберите роль: **storage.editor** (для полного доступа к Object Storage)
5. Нажмите **Сохранить**

### 2.3 Создание статического ключа доступа

1. В сервисном аккаунте перейдите на вкладку **Ключи**
2. Нажмите **Создать новый ключ** → **Статический ключ доступа**
3. Заполните:
   - **Описание**: `EduMap Storage Access Key`
   - **Ключ по умолчанию**: Оставьте включенным
4. Нажмите **Создать**
5. **ВАЖНО**: Скопируйте и сохраните:
   - **Access Key ID** (идентификатор ключа)
   - **Secret Access Key** (секретный ключ)
   
   ⚠️ **Секретный ключ показывается только один раз!** Сохраните его в безопасном месте.

---

## Шаг 3: Настройка структуры папок в Bucket

Рекомендуемая структура:

```
edumap-media/
├── logos/              # Логотипы организаций
│   └── {organization_id}/
│       └── logo.{ext}
├── galleries/          # Галереи организаций
│   └── {organization_id}/
│       ├── image1.{ext}
│       ├── image2.{ext}
│       └── ...
├── licenses/           # Документы лицензий
│   └── {organization_id}/
│       └── license.{ext}
├── documents/          # Другие документы
│   └── {organization_id}/
│       └── {document_name}.{ext}
└── temp/               # Временные файлы (для загрузки)
    └── {upload_id}/
        └── {file_name}.{ext}
```

---

## Шаг 4: Настройка переменных окружения

Добавьте в `.env.local`:

```bash
# Yandex Cloud Storage
YANDEX_CLOUD_ACCESS_KEY_ID=your_access_key_id
YANDEX_CLOUD_SECRET_ACCESS_KEY=your_secret_access_key
YANDEX_CLOUD_BUCKET_NAME=edumap-media
YANDEX_CLOUD_ENDPOINT=https://storage.yandexcloud.net
YANDEX_CLOUD_REGION=ru-central1
```

Для Vercel добавьте эти переменные через Dashboard:
1. Settings → Environment Variables
2. Добавьте все переменные для Production, Preview и Development

---

## Шаг 5: Установка зависимостей

Установите AWS SDK (совместим с Yandex Object Storage):

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## Шаг 6: Настройка публичного доступа (опционально)

Если нужно сделать некоторые файлы публично доступными:

1. В настройках bucket перейдите в **Публичный доступ**
2. Включите **Публичный доступ к чтению объектов**
3. Или используйте **Presigned URLs** для временного доступа (рекомендуется)

---

## Шаг 7: Проверка настройки

После настройки можно проверить подключение:

```bash
npm run test:storage
```

Или используйте скрипт проверки (будет создан).

---

## Безопасность

### Рекомендации:

1. **Никогда не коммитьте ключи** в Git
2. Используйте **Presigned URLs** для временного доступа к файлам
3. Ограничьте CORS только нужными доменами
4. Используйте **Lifecycle policies** для автоматической очистки временных файлов
5. Регулярно ротируйте ключи доступа

### Lifecycle Policy (пример)

Для автоматической очистки временных файлов:

1. В bucket перейдите в **Жизненный цикл**
2. Добавьте правило:
   - **Префикс**: `temp/`
   - **Действие**: Удалить объекты
   - **Через**: 7 дней

---

## Шаг 8: Проверка подключения

После настройки всех переменных окружения, проверьте подключение:

```bash
npm run test:storage
```

Скрипт выполнит следующие тесты:
1. Проверка переменных окружения
2. Загрузка тестового файла
3. Проверка существования файла
4. Получение presigned URL
5. Удаление тестового файла

Если все тесты пройдены успешно, значит настройка выполнена правильно.

---

## Шаг 9: Использование в приложении

### Пример загрузки файла через API

```typescript
// Клиентский код
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'logo');
formData.append('organizationId', '123');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.key - путь к файлу в storage
// result.url - presigned URL для доступа к файлу
```

### Пример использования утилит напрямую (Server-side)

```typescript
import { uploadFile, getFileUrl, getLogoPath } from '@/lib/storage';

// Загрузка логотипа
const logoPath = getLogoPath(organizationId, 'jpg');
await uploadFile({
  key: logoPath,
  file: fileBuffer,
  contentType: 'image/jpeg',
});

// Получение URL для отображения
const url = await getFileUrl(logoPath, 3600); // URL действителен 1 час
```

---

## Следующие шаги

После настройки:
1. ✅ Создать утилиты для работы с Yandex Cloud Storage
2. Интегрировать загрузку файлов в формы (SchoolForm)
3. Настроить обработку изображений (ресайз, оптимизация)
4. Добавить валидацию типов файлов и размеров
5. Обновить базу данных для хранения путей к файлам

---

## Полезные ссылки

- [Документация Yandex Object Storage](https://cloud.yandex.ru/docs/storage/)
- [AWS SDK для JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [CORS настройка](https://cloud.yandex.ru/docs/storage/concepts/cors)

