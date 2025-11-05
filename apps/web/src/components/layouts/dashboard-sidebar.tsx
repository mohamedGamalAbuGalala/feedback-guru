"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Feedback", href: "/dashboard/feedback", icon: "💬" },
  { name: "Kanban Board", href: "/dashboard/board", icon: "📋" },
  { name: "Projects", href: "/dashboard/projects", icon: "🗂️" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold">Feedback Guru</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <span className="text-lg mr-3">🚪</span>
          Sign out
        </Button>
      </div>
    </div>
  );
}
