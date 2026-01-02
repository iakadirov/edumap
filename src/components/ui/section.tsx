import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Стандартные высоты Hero секций
 * - mobile: 400px
 * - sm: 450px
 * - md: 500px
 * - lg: 560px
 */
const HERO_HEIGHT = 'min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[560px]';

/**
 * Стандартные отступы секций
 */
const SECTION_PADDING = {
  hero: 'py-8 sm:py-12 md:py-16 lg:py-20',
  default: 'py-12 sm:py-16 md:py-20',
  compact: 'py-8 sm:py-12 md:py-16',
} as const;

/**
 * Стандартные отступы между элементами в секции
 */
const SECTION_SPACING = {
  header: 'space-y-3 sm:space-y-4',
  content: 'space-y-8 sm:space-y-10 md:space-y-12',
} as const;

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  align?: 'left' | 'center';
}

/**
 * Стандартный заголовок секции
 *
 * @example
 * <SectionHeader
 *   title="Nega aynan EduMap?"
 *   subtitle="Ta'lim muassasasini to'g'ri tanlash uchun barcha kerakli narsalar"
 * />
 */
export function SectionHeader({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  align = 'center',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        SECTION_SPACING.header,
        align === 'center' && 'text-center',
        className
      )}
    >
      <h2
        className={cn(
          'text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] text-[#0c1319]',
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-base sm:text-lg text-[#5a6c7d] leading-relaxed text-balance',
            align === 'center' && 'max-w-2xl mx-auto text-center',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Отступы секции */
  padding?: keyof typeof SECTION_PADDING;
  /** Фоновый цвет */
  variant?: 'default' | 'muted';
  /** ID для якорных ссылок */
  id?: string;
}

/**
 * Обёртка для секции с контейнером
 *
 * @example
 * <Section variant="muted" padding="default">
 *   <SectionHeader title="Features" subtitle="..." />
 *   <div>Content</div>
 * </Section>
 */
export function Section({
  children,
  className,
  padding = 'default',
  variant = 'default',
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'container-wrapper',
        SECTION_PADDING[padding],
        variant === 'muted' && 'bg-gray-50/50',
        id && 'scroll-mt-24',
        className
      )}
    >
      <div className="container-content">
        <div className="container-inner">
          {children}
        </div>
      </div>
    </section>
  );
}

interface SectionContentProps {
  children: ReactNode;
  className?: string;
  /** ID для якорных ссылок */
  id?: string;
}

/**
 * Контейнер для контента секции со стандартными отступами
 */
export function SectionContent({ children, className, id }: SectionContentProps) {
  return (
    <div id={id} className={cn(SECTION_SPACING.content, className)}>
      {children}
    </div>
  );
}

interface HeroSectionProps {
  children: ReactNode;
  className?: string;
  /** Показывать фоновые декорации */
  showDecorations?: boolean;
}

/**
 * Hero секция со стандартной высотой
 *
 * @example
 * <HeroSection>
 *   <h1>Title</h1>
 *   <p>Subtitle</p>
 * </HeroSection>
 */
export function HeroSection({
  children,
  className,
  showDecorations = true,
}: HeroSectionProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background decorations */}
      {showDecorations && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient blob 1 */}
          <div
            className="absolute -top-20 -right-20 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(13,139,242,0.4) 0%, transparent 70%)',
            }}
          />
          {/* Gradient blob 2 */}
          <div
            className="absolute -bottom-32 -left-32 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(49,171,8,0.3) 0%, transparent 70%)',
            }}
          />
          {/* Floating dots - hidden on mobile */}
          <div className="hidden sm:block absolute top-20 left-[15%] w-2 h-2 rounded-full bg-[#0d8bf2]/20 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="hidden sm:block absolute top-40 right-[20%] w-3 h-3 rounded-full bg-[#31ab08]/20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
          <div className="hidden md:block absolute bottom-32 left-[25%] w-2.5 h-2.5 rounded-full bg-[#ef6e2e]/20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-center text-center',
          HERO_HEIGHT,
          SECTION_PADDING.hero
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface HeroTitleProps {
  children: ReactNode;
  className?: string;
}

/**
 * Стандартный заголовок Hero секции
 */
export function HeroTitle({ children, className }: HeroTitleProps) {
  return (
    <h1
      className={cn(
        'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-bold tracking-[-0.03em] text-[#0c1319] leading-[1.15]',
        className
      )}
    >
      {children}
    </h1>
  );
}

interface HeroSubtitleProps {
  children: ReactNode;
  className?: string;
}

/**
 * Стандартный подзаголовок Hero секции
 */
export function HeroSubtitle({ children, className }: HeroSubtitleProps) {
  return (
    <p
      className={cn(
        'w-full text-base sm:text-lg md:text-xl lg:text-2xl text-[#5a6c7d] max-w-2xl mx-auto leading-relaxed text-center text-balance',
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Экспорт констант для использования в других компонентах
 */
export const sectionStyles = {
  HERO_HEIGHT,
  SECTION_PADDING,
  SECTION_SPACING,
} as const;
