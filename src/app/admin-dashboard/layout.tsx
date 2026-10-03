"use client";

import { useState } from "react";
import { Sidebar, NavItem } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  LineChart, 
  BellRing, 
  BrainCircuit, 
  FileText, 
  Settings 
} from "lucide-react";

const adminNavItems: NavItem[] = [
  { title: "Overview", href: "/admin-dashboard/overview", icon: LayoutDashboard },
  { title: "Farmers", href: "/admin-dashboard/farmers", icon: Users },
  { title: "Datasets", href: "/admin-dashboard/datasets", icon: Database },
  { title: "Predictions", href: "/admin-dashboard/predictions", icon: LineChart },
  { title: "Alerts", href: "/admin-dashboard/alerts", icon: BellRing },
  { title: "Models", href: "/admin-dashboard/models", icon: BrainCircuit },
  { title: "Reports", href: "/admin-dashboard/reports", icon: FileText },
  { title: "Settings", href: "/admin-dashboard/settings", icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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
          items={adminNavItems} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          role="Admin"
        />
      </div>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}