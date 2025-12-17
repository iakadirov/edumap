/**
 * Утилита для работы с Solar Icons
 * 
 * Централизованное место для импорта иконок из @solar-icons/react-perf
 * Используется только на публичных страницах (не в админке)
 * 
 * Примечание: Иконки экспортируются без префикса "Solar"
 */

// Re-export всех используемых иконок для удобства
export {
  // Check icons
  CheckCircleBold,
  CheckCircleLinear,
  
  // Star icons
  StarBold,
  StarLinear,
  
  // Shield icons
  ShieldCheckBold,
  ShieldCheckLinear,
  
  // Heart icons
  HeartBold,
  HeartLinear,
  
  // Menu icons
  MenuDotsCircleLinear,
  MenuDotsCircleBold,
  
  // Location icons
  MapPointBold,
  MapPointLinear,
  
  // Book icons
  BookBold,
  BookLinear,
  
  // Add/Plus icons
  AddCircleBold,
  AddCircleLinear,
  
  // Arrow icons
  AltArrowDownLinear,
  AltArrowUpLinear,
  
  // Search icons
  MagniferBold,
  MagniferLinear,
  
  // Close icons
  CloseCircleBold,
  CloseCircleLinear,
  
  // Globe icons
  GlobusBold,
  GlobusLinear,
  
  // Building icons
  BuildingsBold,
  BuildingsLinear,
  
  // User icons
  UserBold,
  UserLinear,
  
  // Calendar icons
  CalendarBold,
  CalendarLinear,
  
  // Phone icons
  PhoneCallingBold,
  PhoneCallingLinear,
  
  // Mail icons
  LetterBold,
  LetterLinear,
  
  // External link icons
  LinkRoundBold,
  LinkRoundLinear,
  
  // Transport icons
  BusBold,
  BusLinear,
  
  // Food icons - используем альтернативу, так как ForkKnife нет
  // Можно использовать иконку еды или оставить как есть
  
  // Clock icons
  ClockCircleBold,
  ClockCircleLinear,
  
  // Camera icons
  CameraBold,
  CameraLinear,
  
  // Chat/Message icons
  ChatRoundBold,
  ChatRoundLinear,
  ChatSquareBold,
  ChatSquareLinear,
  
  // Navigation icons
  StreetsNavigationBold,
  StreetsNavigationLinear,
  
  // Share icons
  ShareBold,
  ShareLinear,
  
  // Alert/Danger icons
  DangerCircleBold,
  DangerCircleLinear,
  
  // Graduation icons
  SquareAcademicCapBold,
  SquareAcademicCapLinear,
  
  // Users icons
  UserHandsBold,
  UserHandsLinear,
  
  // UserCheck icons
  UserCheckBold,
  UserCheckLinear,
  
  // Play icons
  PlayBold,
  PlayLinear,
  
  // ArrowRight icons (AltArrowRight используется вместо ChevronRight)
  AltArrowRightBold,
  AltArrowRightLinear,
  
  // Download icons
  DownloadBold,
  DownloadLinear,
  
  // FileText icons
  FileTextBold,
  FileTextLinear,
  
  // FileCheck icons
  FileCheckBold,
  FileCheckLinear,
  
  // Wallet icons
  WalletBold,
  WalletLinear,
  
  // Like icons
  LikeBold,
  LikeLinear,
  
  // Medal/Trophy icons
  MedalRibbonBold,
  MedalRibbonLinear,
  MedalStarBold,
  MedalStarLinear,
  
  // Flag icons
  FlagBold,
  FlagLinear,
} from '@solar-icons/react-perf';

/**
 * Тип для стиля иконки
 */
export type IconStyle = 'bold' | 'linear' | 'outline';

/**
 * Получить иконку по имени и стилю
 * Helper функция для динамического выбора иконки
 */
export function getIcon(name: string, style: IconStyle = 'linear') {
  // Эта функция может быть расширена для динамического выбора иконок
  // Пока используем прямые импорты для лучшей tree-shaking
  return null;
}

