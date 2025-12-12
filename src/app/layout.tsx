import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduMap.uz — Oʻzbekistonning yagona taʼlim platformasi",
  description: "Ota-onalarga bolalari uchun eng yaxshi taʼlimni tanlashda yordam beramiz — shaffof maʼlumotlar, halol sharhlar va AI tavsiyalari",
};

import { Layout } from '@/components/shared/Layout';

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
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
