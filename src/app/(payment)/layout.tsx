import { ReactNode } from "react";

interface PaymentLayoutProps {
  children: ReactNode;
}

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return <div className="min-h-screen bg-background p-10">{children}</div>;
}
