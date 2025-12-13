# Исправление проблем с перезапуском сервера

## Проблема: "Unable to acquire lock"

Если видите ошибку:
```
⨯ Unable to acquire lock at C:\Claude\edumap\.next\dev\lock, is another instance of next dev running?
```

Это означает, что другой процесс Next.js все еще запущен.

---

## Решение

### Шаг 1: Найти и остановить процесс

**Вариант A: Через Task Manager (Windows)**
1. Откройте Task Manager (Ctrl+Shift+Esc)
2. Найдите процесс `node.exe`
3. Нажмите "End Task"

**Вариант B: Через командную строку**
```bash
# Найти процесс на порту 3000
netstat -ano | findstr :3000

# Остановить процесс (замените PID на номер из команды выше)
taskkill /F /PID <номер_процесса>
```

### Шаг 2: Удалить lock файл

```bash
# В Git Bash или PowerShell
rm -f .next/dev/lock

# Или в Command Prompt
del /F /Q .next\dev\lock
```

### Шаг 3: Перезапустить сервер

```bash
npm run dev
```

---

## Быстрое решение (одна команда)

```bash
# Остановить все процессы node на порту 3000 и удалить lock
taskkill /F /FI "PORT eq 3000" 2>nul & rm -f .next/dev/lock & npm run dev
```

---

## Альтернатива: Использовать другой порт

Если не хотите искать процесс, можно запустить на другом порту:

```bash
PORT=3001 npm run dev
```

Но лучше освободить порт 3000, так как это стандартный порт для разработки.

