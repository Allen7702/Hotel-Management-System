import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import AuthWrappedLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hotel Management System',
  description: 'HMS Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrappedLayout>{children}</AuthWrappedLayout>
      </body>
    </html>
  );
}