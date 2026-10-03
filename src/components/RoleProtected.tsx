"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated } from "@/lib/authClient";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "farmer" | "admin";
}

/**
 * RoleProtectedRoute Component
 * Ensures the user is authenticated AND has the required role.
 */
export default function RoleProtectedRoute({ 
  children, 
  allowedRole 
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // 1. Check if authenticated
      if (!isAuthenticated()) {
        router.push("/signin");
        return;
      }

      // 2. Check role
      const user = getUser();
      if (!user || user.role !== allowedRole) {
        // If role mismatch, redirect to the appropriate default dashboard
        const target = user?.role === "admin" ? "/admin-dashboard/overview" : "/dashboard/overview";
        router.push(target);
        return;
      }

      // 3. Valid
      setChecking(false);
    };

    checkAuth();
  }, [router, allowedRole]);

  // Prevent render before auth check is complete
  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-green/20 border-t-accent-green rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}