import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import QueryProvider from '@/components/layout/QueryProvider';

export const metadata: Metadata = {
  title: { default: 'BlogApp — Ideas Worth Sharing', template: '%s | BlogApp' },
  description: 'A modern blogging platform for developers and creators.',
  keywords: ['blog', 'technology', 'programming', 'writing'],
  authors: [{ name: 'BlogApp' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BlogApp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <QueryProvider>
          <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
