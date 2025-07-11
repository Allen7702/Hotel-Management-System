import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import SideNav from '@/components/SideNav/SideNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hotel Management System',
  description: 'HMS Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <SideNav />
          <div className="ml-64 flex-1 p-6">{children}</div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}