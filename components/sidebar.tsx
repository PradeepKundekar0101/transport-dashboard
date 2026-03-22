"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Truck,
  Bell,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/carriers", label: "Carriers", icon: Truck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar-bg flex flex-col z-50 transition-all duration-300 border-r border-white/5",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-white/10",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-semibold text-sm tracking-tight leading-none">
              AutoTransport
            </h1>
            <span className="text-sidebar-text text-[11px]">
              Dispatch Hub
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-sidebar-active text-white shadow-lg shadow-blue-500/20"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  isActive
                    ? "text-white"
                    : "text-sidebar-text group-hover:text-white"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors text-xs"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
