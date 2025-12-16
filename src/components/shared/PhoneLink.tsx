import Link from 'next/link';
import { formatPhoneForDisplay, getPhoneForTel } from '@/lib/utils/phone';

interface PhoneLinkProps {
  phone: string | null | undefined;
  className?: string;
}

/**
 * Компонент для отображения кликабельного номера телефона
 * Формат отображения: +99890 123 45 67
 * Ссылка: tel:+998901234567
 */
export function PhoneLink({ phone, className }: PhoneLinkProps) {
  const formatted = formatPhoneForDisplay(phone);
  const telLink = getPhoneForTel(phone);

  if (!formatted || !telLink) {
    return null;
  }

  return (
    <Link href={`tel:${telLink}`} className={className}>
      {formatted}
    </Link>
  );
}

