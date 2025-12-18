'use client';

import { AutosaveStatus, formatAutosaveStatus } from '@/lib/schools/autosave';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: AutosaveStatus;
  lastSaved: Date | null;
  error: Error | null;
  className?: string;
}

/**
 * Компонент для визуального отображения состояния сохранения
 * Используется вместе с хуком useAutosave
 */
export function SaveStatusIndicator({
  status,
  lastSaved,
  error,
  className,
}: SaveStatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'saved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 10) return 'hozir';
    if (seconds < 60) return `${seconds} soniya oldin`;
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        className
      )}
    >
      {getIcon()}
      <span className={getTextColor()}>
        {formatAutosaveStatus(status)}
      </span>
      {lastSaved && status !== 'saving' && (
        <span className="text-xs text-muted-foreground">
          ({formatLastSaved(lastSaved)})
        </span>
      )}
      {error && (
        <span className="text-xs text-red-600" title={error.message}>
          {error.message}
        </span>
      )}
    </div>
  );
}

