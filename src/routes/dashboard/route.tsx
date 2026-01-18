'use client';

import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/features/dashboard/ui/app-sidebar';
import { Separator } from '@/shared/ui/separator';
import { SmartBreadcrumbs } from '@/shared/ui/smart-breadcrumbs';
import { userFn } from '@/entities/user/api';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await userFn();

    if (!user) {
      throw redirect({
        to: '/auth/login',
      });
    }

    return {
      user,
      breadcrumb: {
        title: 'Dashboard',
      },
    };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const location = useLocation();

  const isEditorPage = location.pathname.match(/\/dashboard\/templates\/[^/]+$/);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {!isEditorPage && (
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <SmartBreadcrumbs />
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col gap-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
