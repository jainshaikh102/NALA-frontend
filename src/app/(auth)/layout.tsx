import { ReactNode } from "react";
import { RouteGuard } from "@/components/auth/route-guard";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <RouteGuard requireAuth={false}>
      <div className="min-h-screen bg-background p-10">{children}</div>
    </RouteGuard>
  );
}
