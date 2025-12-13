/**
 * Примеры использования Solar Icons в проекте
 * 
 * Этот файл содержит примеры для справки.
 * Не импортируйте этот файл в реальные компоненты.
 */

import { Home, User, Settings, Bell, Search, Menu } from '@solar-icons/react-perf';

// ============================================
// Пример 1: Базовое использование
// ============================================
export function BasicExample() {
  return (
    <div className="flex gap-4">
      <Home size={24} />
      <User size={20} />
      <Settings size={24} />
    </div>
  );
}

// ============================================
// Пример 2: В кнопке
// ============================================
export function ButtonWithIcon() {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded">
      <Home size={16} />
      Главная
    </button>
  );
}

// ============================================
// Пример 3: С Tailwind классами
// ============================================
export function IconWithTailwind() {
  return (
    <div className="space-y-2">
      <Home 
        size={24} 
        className="text-primary hover:text-primary/80 transition-colors cursor-pointer" 
      />
      <User 
        size={20} 
        className="text-muted-foreground hover:text-foreground transition-colors" 
      />
    </div>
  );
}

// ============================================
// Пример 4: В навигации
// ============================================
export function NavigationExample() {
  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: User, label: 'Foydalanuvchilar', href: '/admin/users' },
    { icon: Settings, label: 'Sozlamalar', href: '/admin/settings' },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a 
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

// ============================================
// Пример 5: В Header (поиск, уведомления)
// ============================================
export function HeaderIconsExample() {
  return (
    <div className="flex items-center gap-4">
      <button className="relative">
        <Search size={20} className="text-muted-foreground" />
      </button>
      
      <button className="relative">
        <Bell size={20} className="text-muted-foreground" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      
      <button>
        <Menu size={20} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ============================================
// Пример 6: С кастомными цветами
// ============================================
export function CustomColorsExample() {
  return (
    <div className="flex gap-4">
      <Home size={24} color="#3b82f6" /> {/* Синий */}
      <User size={24} color="#10b981" /> {/* Зеленый */}
      <Settings size={24} color="#f59e0b" /> {/* Желтый */}
      <Bell size={24} className="text-purple-500" /> {/* Через Tailwind */}
    </div>
  );
}

// ============================================
// Пример 7: Размеры иконок
// ============================================
export function IconSizesExample() {
  return (
    <div className="flex items-center gap-4">
      <Home size={16} /> {/* Маленькая */}
      <Home size={20} /> {/* Средняя */}
      <Home size={24} /> {/* Большая (по умолчанию) */}
      <Home size={32} /> {/* Очень большая */}
    </div>
  );
}

// ============================================
// Примечания:
// ============================================
// 1. Все иконки из @solar-icons/react-perf поддерживают:
//    - size: number | string (размер, по умолчанию 24)
//    - color: string (цвет, по умолчанию "currentColor")
//    - className: string (CSS классы)
//    - style: React.CSSProperties (inline стили)
//
// 2. Для поиска иконок используйте:
//    https://solar-icons.vercel.app/
//
// 3. Performance версия (@solar-icons/react-perf) оптимизирована
//    для меньшего размера бандла. Каждая иконка включает только
//    один стиль (Outline по умолчанию).
//
// 4. Если нужна динамическая смена стилей, используйте
//    стандартный пакет @solar-icons/react (но это увеличит bundle size)

