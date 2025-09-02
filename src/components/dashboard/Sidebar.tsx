"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSpecial?: boolean;
  specialIcon?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isSpecial: true,
    specialIcon: "/svgs/Dashboard-WhiteIcon.svg",
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
    isSpecial: true,
    specialIcon: "/svgs/UserMusic-Icon.svg",
  },
  // commenting feedback option
  // {
  //   name: "Help",
  //   href: "/help",
  //   icon: HelpCircle,
  //   isSpecial: true,
  //   specialIcon: "/svgs/Info-WhiteIcon.svg",
  // },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useLogout();
  const { user } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <aside className="h-full w-full flex flex-col">
      {/* Mobile Close Button */}
      <div className="lg:hidden flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Logo */}
      <div className="flex items-center justify-center py-4 lg:py-6">
        <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center">
          <Image
            src="/svgs/Blacklion-Logo.svg"
            alt="Logo"
            width={50}
            height={50}
            className="filter w-full h-full object-contain"
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
              onClick={onClose}
              className={`relative w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 group ${
                isActive
                  ? ""
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {/* Active indicator - Left border */}
              {isActive && (
                <div className="absolute -left-5 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full" />
              )}

              {/* Icon */}
              {item.isSpecial && item.specialIcon ? (
                <Image
                  src={item.specialIcon}
                  alt={item.name}
                  width={28}
                  height={28}
                  // className={isActive ? "opacity-100" : "opacity-70"}
                />
              ) : (
                <IconComponent className="w-7 h-7" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 flex flex-col items-center space-y-4">
        {/* User Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center group relative cursor-pointer hover:bg-gray-300 transition-colors duration-200"
          onClick={() => {
            router.push("/profile");
            onClose();
          }}
        >
          <User className="w-5 h-5 text-white" />
        </div>

        <button
          onClick={handleLogoutClick}
          className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group relative"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancelLogout}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              className="w-full sm:w-auto"
            >
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
