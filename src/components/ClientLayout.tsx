'use client';

import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { setupAxiosInterceptors } from '@/services/api';
import LoginPage from '@/app/login/page';
import { useEffect } from 'react';
import AppSidebar from '@/layout/AppSidebar';
import { SidebarProvider } from '@/context/SidebarContext';

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, token, handleRefreshToken } = useAuth();

  useEffect(() => {
    setupAxiosInterceptors(token, handleRefreshToken);
  }, [token, handleRefreshToken]);

  if (pathname === '/login' || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="flex text-black bg-gray-100 h-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="ml-64 flex-1 p-6 flex-grow bg-gray-100">{children}</div>
        <ToastContainer position="top-right" autoClose={3000} />
      </SidebarProvider>
    </div>
  );
};

export default function AuthWrappedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientLayout>{children}</ClientLayout>
    </AuthProvider>
  );
}