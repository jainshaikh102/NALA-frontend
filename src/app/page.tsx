"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in page as the app starts with auth
    router.replace("/sign-in");
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center scrollbar-hide scroll-smooth">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Nala</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
