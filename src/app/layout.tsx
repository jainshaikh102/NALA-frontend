// app/layout.tsx (RootLayout)
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nala - Your Digital Platform",
  description:
    "A comprehensive platform for managing your digital presence with authentication, payments, and dashboard features.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scrollbar-hide">
      <head>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
        <script src="https://apis.google.com/js/api.js" async defer></script>
      </head>
      {/* 👇 Hide browser scrollbar globally but keep scroll working */}
      <body
        className={`${dmSans.variable} font-sans antialiased scrollbar-hide`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
