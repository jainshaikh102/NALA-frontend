import { ReactNode } from "react";

interface PaymentLayoutProps {
  children: ReactNode;
}

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
    </div>
  );
}
