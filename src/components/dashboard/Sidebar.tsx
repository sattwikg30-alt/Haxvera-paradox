"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { getUser, logout, AuthUser } from "@/lib/authClient";
import { useEffect, useState } from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  setCollapsed: (col: boolean) => void;
  role: string;
}

export function Sidebar({ items, collapsed, setCollapsed, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/5 bg-[#020402] transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.5)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4 relative group">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="text-white">Agri</span>
            <span className="text-accent-green drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">Go</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-accent-green/20 text-accent-green font-bold border border-accent-green/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            A
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-secondary hover:text-white hover:bg-white/5 rounded-md p-1 transition-colors"
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 group",
                isActive
                  ? "bg-accent-green/[0.08] text-accent-green border border-accent-green/20 shadow-[inset_0_0_20px_rgba(0,255,136,0.05)]"
                  : "text-text-secondary hover:bg-white/5 hover:text-white border border-transparent",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon 
                size={20} 
                className={cn(
                  "transition-all duration-300", 
                  isActive ? "text-accent-green drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" : "text-text-secondary group-hover:text-white"
                )} 
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </div>

      {/* Profile */}
      <div className="border-t border-white/5 p-4 bg-white/[0.01]">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-green/10 text-accent-green font-bold border border-accent-green/20 uppercase">
            {mounted && user?.name?.[0] ? user.name[0] : "U"}
          </div>
          {!collapsed && (
            <div className="flex flex-1 flex-col truncate">
              <span className="truncate text-sm font-bold text-white tracking-wide">
                {mounted && user?.name ? user.name : "User"}
              </span>
              <span className="truncate text-xs text-text-secondary font-medium capitalize">
                {mounted && user?.role ? user.role : role}
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}