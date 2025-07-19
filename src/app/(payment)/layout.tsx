import { ReactNode } from 'react';

interface PaymentLayoutProps {
  children: ReactNode;
}

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Nala</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Secure Payment</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <span>© 2024 Nala. All rights reserved.</span>
            <span>•</span>
            <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
