import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import AuthWrappedLayout from '@/components/AdminLayout';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hotel Management System',
  description: 'HMS Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthWrappedLayout>
              {children}
          </AuthWrappedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}