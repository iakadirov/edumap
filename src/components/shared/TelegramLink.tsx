'use client';

import Link from 'next/link';
import { formatTelegramForDisplay } from '@/lib/utils/telegram';

interface TelegramLinkProps {
  telegram: string | null | undefined;
  className?: string;
}

export function TelegramLink({ telegram, className = '' }: TelegramLinkProps) {
  const telegramData = formatTelegramForDisplay(telegram);

  if (!telegramData) {
    return null;
  }

  return (
    <Link
      href={telegramData.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-primary hover:underline ${className}`}
    >
      {telegramData.display}
    </Link>
  );
}

