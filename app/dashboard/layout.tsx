"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const sidebarItems = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Overview",
    helper: "Today focus and targets",
    href: "/dashboard",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Clients",
    helper: "Leads and relationships",
    href: "/dashboard/clients",
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    label: "Projects",
    helper: "Delivery pipeline",
    href: "/dashboard/projects",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: "Invoices",
    helper: "Cash flow and payments",
    href: "/dashboard/invoices",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Proposals",
    helper: "Pitch faster with AI",
    href: "/dashboard/proposals",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Analytics",
    helper: "Performance signals",
    href: "/dashboard/analytics",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthorized(true);
    if (firstName && lastName && firstName !== "undefined" && lastName !== "undefined") {
      setUser({ firstName, lastName });
    }
  }, [router]);

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const pageTitle =
    sidebarItems.find((item) => (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)))
      ?.label || "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    router.push("/login");
  };

  const now = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Freelancer";
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "FL";

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050b16]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8ccfff]/35 border-t-[#8ccfff]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#ecf2ff]">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-45" />

      <motion.aside
        initial={false}
        animate={{ width: isMobile ? 0 : isCollapsed ? 92 : 286 }}
        transition={{ type: "spring", stiffness: 280, damping: 34 }}
        className="fixed left-0 top-0 z-40 hidden h-full border-r border-[#8ccfff]/20 bg-[#08172a]/92 backdrop-blur-xl lg:block"
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className={`mb-7 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed ? (
              <div>
                <p className="font-[var(--font-space)] text-xl font-semibold gradient-text">Sass Dashboard</p>
                <p className="mt-1 text-xs text-[#cae7ff]/70">Freelancer command center</p>
              </div>
            ) : (
              <p className="font-[var(--font-space)] text-lg font-semibold gradient-text">SD</p>
            )}
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="rounded-md border border-[#8ccfff]/30 bg-[#0b223a] p-1.5 text-[#cae7ff] transition hover:border-[#8ccfff]/50"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                    isActive
                      ? "surface-strong text-[#f6fbff]"
                      : "text-[#d2e9ff]/75 hover:bg-[#0d2a46] hover:text-[#f6fbff]"
                  }`}
                >
                  <div className={`${isActive ? "text-[#7ed5ff]" : "text-[#acd7ff]/75"}`}>{item.icon}</div>
                  {!isCollapsed && (
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-[11px] text-[#acd7ff]/70">{item.helper}</p>
                    </div>
                  )}
                  {isActive && <span className="absolute right-2 h-2 w-2 rounded-full bg-[#ffd16d]" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 border-t border-[#8ccfff]/15 pt-5">
            <button className={`w-full rounded-xl border border-[#8ccfff]/20 bg-[#0b223a]/80 px-3 py-2.5 text-sm text-[#d2e9ff] transition hover:border-[#8ccfff]/40 ${isCollapsed ? "text-center" : "text-left"}`}>
              <span className="inline-flex items-center gap-2">
                <Settings className="h-4 w-4" /> {!isCollapsed && "Settings"}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className={`w-full rounded-xl border border-[#ff9a9a]/30 bg-[#3c1a22]/65 px-3 py-2.5 text-sm text-[#ffd6d6] transition hover:border-[#ff9a9a]/55 ${isCollapsed ? "text-center" : "text-left"}`}
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" /> {!isCollapsed && "Logout"}
              </span>
            </button>
          </div>
        </div>
      </motion.aside>

      <motion.main
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : isCollapsed ? 92 : 286 }}
        transition={{ type: "spring", stiffness: 280, damping: 34 }}
        className="relative min-h-screen px-4 pb-28 pt-6 md:px-6 md:pt-8 lg:px-8 lg:pb-8"
      >
        <header className="surface spotlight relative mb-6 overflow-hidden rounded-2xl px-5 py-4 md:px-6">
          <div className="absolute -top-10 right-0 h-36 w-36 rounded-full bg-[#4cc9f0]/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8ccfff]">{now}</p>
              <h1 className="mt-1 font-[var(--font-space)] text-2xl font-semibold text-[#f5fbff] md:text-3xl">{pageTitle}</h1>
              <p className="mt-1 text-sm text-[#cae7ff]/80">
                Welcome back, <span className="font-semibold text-[#f7fbff]">{fullName}</span>. Focus on what ships and what gets paid.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Link
                href="/dashboard/projects"
                className="data-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> New Project
              </Link>
              <Link
                href="/dashboard/proposals"
                className="data-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" /> Generate Proposal
              </Link>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#8ccfff]/30 bg-[#0e2d4b] text-xs font-bold text-[#f7fbff]">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[min(95%,520px)] -translate-x-1/2 items-center justify-between rounded-2xl border border-[#8ccfff]/30 bg-[#09182a]/90 px-3 py-2 backdrop-blur-xl lg:hidden">
        {sidebarItems.slice(0, 5).map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center rounded-xl px-2 py-1.5 text-[10px] font-medium transition ${
                isActive ? "bg-[#12385b] text-[#f8fdff]" : "text-[#c5e6ff]/80"
              }`}
            >
              {item.icon}
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
