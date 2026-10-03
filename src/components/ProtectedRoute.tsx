"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/authClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps pages that require authentication for client-side redirection
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        const url = new URL("/signin", window.location.origin);
        url.searchParams.set("callbackUrl", pathname);
        router.push(url.pathname + url.search);
        return;
      }
      setChecking(false);
    };

    checkAuth();
  }, [router, pathname]);

  // Prevent render before auth check is complete
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}