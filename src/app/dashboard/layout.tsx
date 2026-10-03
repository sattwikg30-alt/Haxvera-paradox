"use client";

import { useState } from "react";
import { Sidebar, NavItem } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  LayoutDashboard, 
  Sprout, 
  TrendingUp, 
  AlertTriangle, 
  CloudSun, 
  Map, 
  History, 
  BellRing, 
  Settings 
} from "lucide-react";

const farmerNavItems: NavItem[] = [
  { title: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Yield Prediction", href: "/dashboard/yield-prediction", icon: TrendingUp },
  { title: "My Crops", href: "/dashboard/my-crops", icon: Sprout },
  { title: "Risk Analysis", href: "/dashboard/risk-analysis", icon: AlertTriangle },
  { title: "Weather", href: "/dashboard/weather", icon: CloudSun },
  { title: "Soil Data", href: "/dashboard/soil-data", icon: Map },
  { title: "History", href: "/dashboard/history", icon: History },
  { title: "Alerts", href: "/dashboard/alerts", icon: BellRing },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

import ChatWidget from "@/components/chatbot/ChatWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden text-white selection:bg-accent-green/30">
        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-30 bg-slate-900/50 md:hidden animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar Wrapper */}
        <div 
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar 
            items={farmerNavItems} 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
            role="Farmer"
          />
        </div>

        <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* Global AI Chat Assistant Widget */}
      <ChatWidget />
    </ProtectedRoute>
  );
}