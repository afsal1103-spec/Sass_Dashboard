"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { icon: <Home className="h-5 w-5" />, label: "Overview", href: "/dashboard" },
  { icon: <Users className="h-5 w-5" />, label: "Clients", href: "/dashboard/clients" },
  { icon: <Briefcase className="h-5 w-5" />, label: "Projects", href: "/dashboard/projects" },
  { icon: <CreditCard className="h-5 w-5" />, label: "Invoices", href: "/dashboard/invoices" },
  { icon: <FileText className="h-5 w-5" />, label: "AI Proposals", href: "/dashboard/proposals" },
  { icon: <BarChart3 className="h-5 w-5" />, label: "Analytics", href: "/dashboard/analytics" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-white/10 bg-black p-4">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
            <span className="font-bold">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Sass Dash</span>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-white/60">Welcome back, Afsal</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90">
            <Plus className="h-4 w-4" /> New Project
          </button>
        </header>

        {children}
      </main>
    </div>
  );
}
