'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { setupAxiosInterceptors } from '@/services/api';
import LoginPage from '@/app/login/page';
import { useEffect } from 'react';
import AppSidebar from '@/layout/AppSidebar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import Backdrop from '@/layout/Backdrop';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, token, handleRefreshToken } = useAuth();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[260px]"
      : "lg:ml-[90px]";

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
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
};


export default function AuthWrappedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AdminLayout>{children}</AdminLayout>
      </SidebarProvider>
    </AuthProvider>


  );
}