import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  // Оптимизация: загружаем только критичные веса сразу
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "EduMap.uz — Oʻzbekistonning yagona taʼlim platformasi",
  description: "Ota-onalarga bolalari uchun eng yaxshi taʼlimni tanlashda yordam beramiz — shaffof maʼlumotlar, halol sharhlar va AI tavsiyalari",
  other: {
    // Resource hints через metadata (добавляются автоматически Next.js для fonts)
    // Preconnect для Supabase добавим через next.config.ts headers
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${onest.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
