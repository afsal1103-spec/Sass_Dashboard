"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlarmClock,
  ArrowUpRight,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";

interface DashboardStats {
  totalProjects: number;
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
}

const weekRevenue = [52, 68, 74, 60, 82, 92, 88, 96, 104, 84, 110, 118];

const focusItems = [
  {
    title: "Follow up on pending payments",
    detail: "Send reminder to invoices older than 7 days.",
    link: "/dashboard/invoices",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: "Convert warm leads",
    detail: "Generate proposals for leads marked as active this week.",
    link: "/dashboard/proposals",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Protect delivery deadlines",
    detail: "Review projects due in the next 10 days and set milestones.",
    link: "/dashboard/projects",
    icon: <Briefcase className="h-4 w-4" />,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/analytics/summary");
        setDashboardStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const snapshot = useMemo(() => {
    const revenue = dashboardStats.totalRevenue || 0;
    const target = Math.max(revenue * 1.2, 1000);
    const progress = Math.min(Math.round((revenue / target) * 100), 100);

    return {
      monthlyTarget: target,
      monthlyProgress: progress,
      invoicesHealth: dashboardStats.totalInvoices === 0 ? "Excellent" : dashboardStats.totalInvoices < 4 ? "Stable" : "Attention",
      clientDensity:
        dashboardStats.totalProjects === 0
          ? 0
          : Number((dashboardStats.totalClients / dashboardStats.totalProjects).toFixed(1)),
    };
  }, [dashboardStats]);

  const kpis = [
    {
      title: "Revenue Collected",
      value: formatCurrency(dashboardStats.totalRevenue),
      hint: `${snapshot.monthlyProgress}% of monthly target`,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Active Projects",
      value: dashboardStats.totalProjects.toString(),
      hint: "Delivery pipeline",
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Clients Managed",
      value: dashboardStats.totalClients.toString(),
      hint: `${snapshot.clientDensity || 0} clients/project avg`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Open Invoices",
      value: dashboardStats.totalInvoices.toString(),
      hint: `Status: ${snapshot.invoicesHealth}`,
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="surface soft-glow rounded-2xl p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#91d8ff]/30 bg-[#113557]/80 text-[#91d8ff]">
                {item.icon}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#ffd16d]/35 bg-[#3f3214]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#ffd16d]">
                <TrendingUp className="h-3 w-3" /> Track
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9dccf1]">{item.title}</p>
            <h3 className="mt-2 font-[var(--font-space)] text-2xl font-semibold text-[#f4fbff]">{isLoading ? "..." : item.value}</h3>
            <p className="mt-1 text-xs text-[#cae7ff]/78">{item.hint}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="surface spotlight relative overflow-hidden rounded-2xl p-5 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-[var(--font-space)] text-xl font-semibold text-[#f4fbff]">Revenue Momentum</h2>
              <p className="mt-1 text-sm text-[#cae7ff]/78">See where your income pace is strengthening week by week.</p>
            </div>
            <span className="data-chip rounded-full px-3 py-1 text-xs font-semibold">Last 12 Weeks</span>
          </div>

          <div className="flex h-56 items-end gap-2">
            {weekRevenue.map((point, idx) => {
              const height = Math.max(18, point * 1.4);
              return (
                <motion.div
                  key={idx}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height, opacity: 1 }}
                  transition={{ delay: idx * 0.03, duration: 0.5 }}
                  className="group relative flex-1 rounded-t-md bg-gradient-to-t from-[#145487] via-[#2f8ec5] to-[#7fd4ff]"
                >
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-[#031227] px-1.5 py-0.5 text-[10px] font-semibold text-[#dff4ff] opacity-0 transition group-hover:opacity-100">
                    {formatCurrency(point * 100)}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9dccf1]/70">
            <span>W1</span>
            <span>W4</span>
            <span>W8</span>
            <span>W12</span>
          </div>
        </article>

        <article className="surface rounded-2xl p-5">
          <h2 className="font-[var(--font-space)] text-xl font-semibold text-[#f4fbff]">Today Focus</h2>
          <p className="mt-1 text-sm text-[#cae7ff]/76">Daily actions that improve delivery and cash flow.</p>

          <div className="mt-5 space-y-3">
            {focusItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-[#8ccfff]/22 bg-[#0b2138]/85 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#8ccfff]/30 bg-[#12395d] text-[#8fd8ff]">
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#edf7ff]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#cae7ff]/72">{item.detail}</p>
                    <Link href={item.link} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#ffd16d] hover:text-[#ffe2a3]">
                      Open <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="surface rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-space)] text-xl font-semibold text-[#f4fbff]">Freelancer Health</h2>
            <span className="rounded-full border border-[#8ccfff]/30 bg-[#103a60] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a3dcff]">
              Snapshot
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#8ccfff]/22 bg-[#0d2c49]/72 p-3">
              <p className="text-xs text-[#a9d9fb]">Monthly Target</p>
              <p className="mt-1 text-lg font-semibold text-[#f4fbff]">{formatCurrency(snapshot.monthlyTarget)}</p>
            </div>
            <div className="rounded-xl border border-[#8ccfff]/22 bg-[#0d2c49]/72 p-3">
              <p className="text-xs text-[#a9d9fb]">Completion</p>
              <p className="mt-1 text-lg font-semibold text-[#f4fbff]">{snapshot.monthlyProgress}%</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-[#b5dcfa]">
              <span>Revenue progress</span>
              <span>{snapshot.monthlyProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#0d2137]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${snapshot.monthlyProgress}%` }}
                transition={{ duration: 0.7 }}
                className="h-full bg-gradient-to-r from-[#4cc9f0] via-[#6fd6ff] to-[#ffd16d]"
              />
            </div>
          </div>
        </article>

        <article className="surface rounded-2xl p-5">
          <h2 className="font-[var(--font-space)] text-xl font-semibold text-[#f4fbff]">Weekly Rhythm</h2>
          <p className="mt-1 text-sm text-[#cae7ff]/76">Balanced execution system for client work.</p>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-xl border border-[#8ccfff]/20 bg-[#0c263f] px-3 py-2.5">
              <AlarmClock className="mt-0.5 h-4 w-4 text-[#7fd4ff]" />
              <p className="text-[#ddf3ff]">Monday: Plan scope and lock deliverables with clients.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[#8ccfff]/20 bg-[#0c263f] px-3 py-2.5">
              <CalendarCheck className="mt-0.5 h-4 w-4 text-[#7fd4ff]" />
              <p className="text-[#ddf3ff]">Midweek: Share progress checkpoints before surprises happen.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[#8ccfff]/20 bg-[#0c263f] px-3 py-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#7fd4ff]" />
              <p className="text-[#ddf3ff]">Friday: Invoices out, wins documented, next week pre-loaded.</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#ffd16d]/30 bg-[#3f3011]/55 p-3 text-xs text-[#ffe2a3]">
            <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.18em]">
              <Target className="h-3 w-3" /> Pro Tip
            </span>
            <p className="mt-1.5 text-sm text-[#ffe7b8]">Send invoices within 24 hours of milestone delivery to reduce payment delays.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
