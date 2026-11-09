import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import AdminShell from '@/components/shared/AdminShell';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fobign Admin Panel',
  description: 'Fobign Administration & Management Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} dark`} suppressHydrationWarning>
      <body className={`min-h-screen bg-[#151517] text-[#f0f2f5] ${nunito.className}`} suppressHydrationWarning>
        <Script
          id="theme-init-admin"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fobign_theme');
                if (theme === 'Light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
