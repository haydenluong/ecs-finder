import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Analytics from '@/components/Analytics';
import LangProvider from '@/i18n/LangProvider';
import '../index.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: 'ECs Finder',
  description:
    'Tìm kiếm hoạt động ngoại khóa, câu lạc bộ, cuộc thi và sự kiện dành cho học sinh Việt Nam.',
  icons: { icon: '/logo.jpg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        {GA_ID && <link rel="preconnect" href="https://www.googletagmanager.com" />}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LangProvider>
          {children}
          {GA_ID && <Analytics gaId={GA_ID} />}
        </LangProvider>
      </body>
    </html>
  );
}
