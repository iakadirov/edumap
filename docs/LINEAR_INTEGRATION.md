# Интеграция с Linear API — EduMap.uz

> **Примечание:** Для автоматической работы над задачами используйте [официальную интеграцию Cursor ↔ Linear](./CURSOR_LINEAR_INTEGRATION.md).
> 
> Эта документация описывает программную интеграцию через API для:
> - Чтения задач из кода
> - Создания задач программно
> - Скриптов и автоматизации
- API endpoints для получения задач

## 🔑 Настройка

### 1. Получение API ключа из Linear

1. Откройте Linear: https://linear.app
2. Перейдите в **Settings** → **API** → **Personal API keys**
3. Нажмите **Create new key**
4. Дайте ключу имя (например: "EduMap Development")
5. Скопируйте созданный API ключ

### 2. Добавление ключа в проект

Создайте файл `.env.local` в корне проекта:

```bash
# .env.local
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Важно:** Файл `.env.local` уже добавлен в `.gitignore` и не попадет в Git.

### 3. Установка зависимостей

Зависимости уже установлены. Если нужно переустановить:

```bash
npm install @linear/sdk graphql
```

## 📝 Использование

### В коде (TypeScript)

```typescript
import { getAllIssues, createIssue, updateIssue } from '@/lib/linear';

// Получить все задачи
const issues = await getAllIssues();

// Получить задачи в работе
import { getInProgressIssues } from '@/lib/linear';
const inProgress = await getInProgressIssues();

// Создать новую задачу
const newIssue = await createIssue({
  teamId: 'your-team-id',
  title: '[SCHOOLS] Добавить фильтр по району',
  description: 'Добавить возможность фильтровать школы по району Ташкента',
  priority: 2,
});

// Обновить задачу
await updateIssue(issueId, {
  stateId: 'completed-state-id',
});
```

### В API Route (Next.js)

Создайте файл `src/app/api/linear/issues/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getAllIssues } from '@/lib/linear';

export async function GET() {
  try {
    const issues = await getAllIssues();
    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка получения задач из Linear' },
      { status: 500 }
    );
  }
}
```

## 🛠 Скрипты для командной строки

Создайте папку `scripts/` и добавьте утилиты:

### Получить задачи

```typescript
// scripts/linear-list.ts
import { getAllIssues } from '../src/lib/linear';

async function main() {
  const issues = await getAllIssues();
  console.log('\n📋 Задачи в Linear:\n');
  issues.forEach((issue) => {
    console.log(`${issue.identifier}: ${issue.title}`);
    console.log(`   Статус: ${issue.state.name}`);
    console.log(`   URL: ${issue.url}\n`);
  });
}

main().catch(console.error);
```

Запуск:
```bash
npx tsx scripts/linear-list.ts
```

## 🔄 Workflow с Claude

### Вариант 1: Ручной (рекомендуется для начала)

1. Откройте Linear и выберите задачу
2. Скопируйте описание задачи
3. Вставьте в чат с Claude:
   ```
   Задача из Linear: [описание]
   Идентификатор: EDU-123
   
   Что нужно сделать:
   - [детали задачи]
   ```

### Вариант 2: Автоматический (через API)

Создайте скрипт для получения задач:

```typescript
// scripts/get-linear-task.ts
import { getTodoIssues } from '../src/lib/linear';

async function main() {
  const issues = await getTodoIssues();
  
  if (issues.length === 0) {
    console.log('Нет задач в статусе Todo');
    return;
  }
  
  // Показываем первую задачу
  const issue = issues[0];
  console.log(`\n📌 Задача: ${issue.identifier}`);
  console.log(`   ${issue.title}\n`);
  console.log(`Описание:`);
  console.log(issue.description || 'Без описания');
  console.log(`\nURL: ${issue.url}\n`);
}

main().catch(console.error);
```

Запуск:
```bash
npx tsx scripts/get-linear-task.ts
```

## 🎯 Рекомендуемый процесс работы

### Утром (выбор задачи на день)

1. Запустите скрипт получения задач или откройте Linear
2. Выберите задачу из списка "Todo" или "In Progress"
3. Скопируйте контекст задачи в Cursor/Claude

### Во время работы

1. После завершения задачи:
   ```typescript
   await updateIssue(issueId, {
     stateId: 'completed-state-id',
   });
   ```
2. Или обновите вручную в Linear

### Создание новых задач

Если в процессе работы появилась новая задача:

```typescript
await createIssue({
  teamId: teamId,
  title: '[SCHOOLS] Описание задачи',
  description: 'Детальное описание',
  priority: 2, // 0-4, где 4 = Critical
});
```

## 📊 Структура задач в Linear

Рекомендуемый формат заголовков:

```
[SCHOOLS] Компонент SchoolCard
[UI] Header с навигацией
[DB] Таблица organizations
[DOCS] Обновить архитектуру
[API] Endpoint для списка школ
```

## 🔍 Получение ID команды (Team)

Чтобы создать задачу, нужен ID команды. Получите его так:

```typescript
import { getTeams } from '@/lib/linear';

const teams = await getTeams();
console.log(teams);
// [
//   { id: 'xxx', name: 'EduMap', key: 'EDU' },
//   ...
// ]
```

## 🚨 Устранение проблем

### Ошибка: "LINEAR_API_KEY не найден"

1. Проверьте, что файл `.env.local` существует
2. Проверьте, что ключ начинается с `lin_api_`
3. Перезапустите dev-сервер: `npm run dev`

### Ошибка подключения к Linear

1. Проверьте интернет-соединение
2. Проверьте, что API ключ активен в Linear
3. Проверьте, что ключ имеет нужные права доступа

### Задачи не находятся

1. Убедитесь, что задачи есть в вашей команде
2. Проверьте фильтры в функциях (`teamId`, `state.type`)
3. Используйте `getAllIssues()` для отладки

## 📚 Ресурсы

- [Linear API Documentation](https://developers.linear.app/docs)
- [Linear SDK для TypeScript](https://github.com/linear/linear)
- [Linear GraphQL API](https://developers.linear.app/docs/graphql)

---

*Последнее обновление: Декабрь 2025*

