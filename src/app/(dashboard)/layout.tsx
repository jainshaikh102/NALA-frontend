"use client";
import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { RouteGuard } from "@/components/auth/route-guard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-secondary">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
