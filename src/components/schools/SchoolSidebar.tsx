'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneLink } from '@/components/shared/PhoneLink';
import {
  PhoneCallingBold,
  LetterBold,
  GlobusBold,
  ChatRoundBold,
  MapPointBold,
  StreetsNavigationBold,
  HeartBold,
  ShareBold,
  DangerCircleBold,
  CalendarBold,
  LinkRoundLinear,
} from '@solar-icons/react-perf';
import type { SchoolProfile } from '@/types/school';

interface SchoolSidebarProps {
  school: SchoolProfile;
  onCompareToggle?: () => void;
  onSaveToggle?: () => void;
  isInComparison?: boolean;
  isSaved?: boolean;
}

/**
 * Боковая панель страницы профиля школы
 * 
 * Включает:
 * - Цена и CTA (стоимость, кнопки действий, бейдж набора)
 * - Контакты (телефоны, email, сайт, социальные сети)
 * - Адрес (Yandex Maps карта, адрес, кнопка маршрута)
 * - Действия (сравнение, избранное, поделиться, пожаловаться)
 */
export function SchoolSidebar({
  school,
  onCompareToggle,
  onSaveToggle,
  isInComparison = false,
  isSaved = false,
}: SchoolSidebarProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };
  
  // Форматируем URL сайта для отображения
  const formatWebsite = (url?: string) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '');
  };
  
  // Форматируем Instagram username
  const formatInstagram = (username?: string) => {
    if (!username) return '';
    return username.replace(/^@/, '');
  };
  
  // Форматируем Telegram username
  const formatTelegram = (username?: string) => {
    if (!username) return '';
    return username.replace(/^@/, '');
  };
  
  return (
    <div className="space-y-4">
      {/* Price & CTA Card */}
      <Card className="border-2 border-blue-100 bg-blue-50/30">
        <CardContent className="p-5">
          {/* Price */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Стоимость обучения</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-500">от</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(school.fee.min)}
              </span>
            </div>
            {school.fee.max && (
              <div className="text-gray-600">
                до {formatPrice(school.fee.max)}{' '}
                {school.fee.currency === 'UZS' ? 'сум' : '$'}
                <span className="text-gray-400">
                  {' '}/{school.fee.period === 'month' ? 'месяц' : 'год'}
                </span>
              </div>
            )}
          </div>
          
          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button className="w-full" size="lg">
              <CalendarBold className="w-4 h-4 mr-2" />
              Записаться на визит
            </Button>
            <Button variant="outline" className="w-full">
              <ChatRoundBold className="w-4 h-4 mr-2" />
              Задать вопрос
            </Button>
          </div>
          
          {/* Open Enrollment Badge */}
          {school.hasOpenEnrollment && (
            <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CalendarBold className="w-4 h-4" />
              <span className="text-sm font-medium">
                Открыт набор на {school.enrollmentYear || new Date().getFullYear() + 1}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Contacts Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Контакты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Phones */}
          {school.contacts.phones.map((phone, idx) => (
            <div key={idx} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition">
              <PhoneCallingBold className="w-4 h-4 text-gray-400" />
              <PhoneLink phone={phone} />
            </div>
          ))}
          
          {/* Email */}
          <a
            href={`mailto:${school.contacts.email}`}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
          >
            <LetterBold className="w-4 h-4 text-gray-400" />
            <span>{school.contacts.email}</span>
          </a>
          
          {/* Website */}
          {school.contacts.website && (
            <a
              href={school.contacts.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition"
            >
              <GlobusBold className="w-4 h-4 text-gray-400" />
              <span className="truncate">{formatWebsite(school.contacts.website)}</span>
              <LinkRoundLinear className="w-3 h-3 text-gray-400 flex-shrink-0" />
            </a>
          )}
          
          {/* Social Links */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            {school.contacts.telegram && (
              <a
                href={`https://t.me/${formatTelegram(school.contacts.telegram)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                title="Telegram"
              >
                <ChatRoundBold className="w-4 h-4" />
              </a>
            )}
            {school.contacts.instagram && (
              <a
                href={`https://instagram.com/${formatInstagram(school.contacts.instagram)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition"
                title="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {school.contacts.facebook && (
              <a
                href={school.contacts.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition"
                title="Facebook"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Map Card */}
      {school.location.coordinates.lat && school.location.coordinates.lng && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Адрес</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Map */}
            <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-3 overflow-hidden">
              <iframe
                src={`https://yandex.ru/map-widget/v1/?pt=${school.location.coordinates.lng},${school.location.coordinates.lat}&z=15&l=map`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                title="Карта"
                onLoad={() => setIsMapLoaded(true)}
              />
            </div>
            
            {/* Address Text */}
            <div className="flex items-start gap-2 text-gray-700 mb-3">
              <MapPointBold className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{school.location.district}</div>
                <div className="text-sm text-gray-500">{school.location.address}</div>
              </div>
            </div>
            
            {/* Directions Button */}
            <Button variant="outline" className="w-full" asChild>
              <a
                href={`https://yandex.ru/maps/?rtext=~${school.location.coordinates.lat},${school.location.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <StreetsNavigationBold className="w-4 h-4 mr-2" />
                Построить маршрут
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Actions Card */}
      <Card>
        <CardContent className="p-4 space-y-2">
          {/* Compare */}
          {onCompareToggle && (
            <button
              onClick={onCompareToggle}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <Checkbox checked={isInComparison} />
              <span className="text-gray-700">Добавить к сравнению</span>
            </button>
          )}
          
          {/* Save */}
          {onSaveToggle && (
            <button
              onClick={onSaveToggle}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left"
            >
              <HeartBold
                className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
              <span className="text-gray-700">
                {isSaved ? 'В избранном' : 'Сохранить в избранное'}
              </span>
            </button>
          )}
          
          {/* Share */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: school.name,
                  text: school.shortDescription || school.description,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                // Можно добавить toast уведомление
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left"
          >
            <ShareBold className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">Поделиться</span>
          </button>
          
          {/* Report */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition text-left text-gray-500">
            <DangerCircleBold className="w-5 h-5" />
            <span>Сообщить о проблеме</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

