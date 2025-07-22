"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  MessageSquare,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Users,
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSpecial?: boolean;
  specialIcon?: string;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
    isSpecial: true,
    specialIcon: "/svgs/Golden-Paw.svg",
  },
  {
    name: "Artist Roaster",
    href: "/my-artists",
    icon: Users,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useLogout();
  const { user } = useAuthStore();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <aside className="w-24 bg-background min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center py-6">
        <div className="w-10 h-10 flex items-center justify-center">
          <Image
            src="/svgs/Blacklion-Logo.svg"
            alt="Logo"
            width={50}
            height={50}
            className="filter"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center space-y-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 group ${
                isActive
                  ? ""
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-5 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />
              )}

              {/* Icon */}
              {item.isSpecial && item.specialIcon ? (
                <Image
                  src={item.specialIcon}
                  alt={item.name}
                  width={20}
                  height={20}
                  className={isActive ? "opacity-100" : "opacity-70"}
                />
              ) : (
                <IconComponent className="w-5 h-5" />
              )}

              {/* Tooltip */}
              <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 flex flex-col items-center space-y-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center group relative">
          <User className="w-5 h-5 text-white" />

          {/* User Info Tooltip */}
          {user && (
            <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="font-medium">
                {user.full_name || user.username || "User"}
              </div>
              <div className="text-gray-300">{user.email}</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group relative"
        >
          <LogOut className="w-5 h-5" />

          {/* Tooltip */}
          <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Logout
          </div>
        </button>
      </div>
    </aside>
  );
}
