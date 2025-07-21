"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const { logout } = useLogout();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", current: true },
    { name: "Analytics", href: "/dashboard/analytics", current: false },
    { name: "Projects", href: "/dashboard/projects", current: false },
    { name: "Settings", href: "/dashboard/settings", current: false },
  ];

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-foreground">Nala</h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center space-x-2 text-foreground hover:text-foreground/80">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {getUserInitials(user)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {getUserDisplayName(user)}
                    </span>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-card shadow-sm min-h-screen">
            <nav className="mt-8 px-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 text-sm font-medium rounded-md ${
                        item.current
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Subscription Status */}
            <div className="mt-8 mx-4 p-4 bg-accent rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                <span className="text-sm font-medium text-accent-foreground">
                  Pro Plan
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active until Jan 19, 2025
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
