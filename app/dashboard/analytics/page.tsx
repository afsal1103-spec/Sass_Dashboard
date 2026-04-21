"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CircleDollarSign, FileText, Target, Users, Workflow } from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

interface AnalyticsSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  leadClients: number;
  totalInvoices: number;
  overdueInvoices: number;
  proposalCount: number;
  totalRevenue: number;
  totalBilled: number;
  pendingRevenue: number;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalClients: 0,
    leadClients: 0,
    totalInvoices: 0,
    overdueInvoices: 0,
    proposalCount: 0,
    totalRevenue: 0,
    totalBilled: 0,
    pendingRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const spring = { type: "spring", stiffness: 320, damping: 24 };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get("/analytics/summary");
        setSummary((prev) => ({ ...prev, ...response.data }));
      } catch (error: any) {
        toast.error(error.response?.data || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const completionRate = useMemo(() => {
    if (!summary.totalProjects) return 0;
    return Math.round((summary.completedProjects / summary.totalProjects) * 100);
  }, [summary.completedProjects, summary.totalProjects]);

  const pipeline = [
    {
      label: "Leads",
      value: summary.leadClients,
      helper: `${summary.totalClients} total clients`,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Proposals",
      value: summary.proposalCount,
      helper: "Pitch-ready docs",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Active Projects",
      value: summary.activeProjects,
      helper: `${completionRate}% completion rate`,
      icon: <Workflow className="h-4 w-4" />,
    },
    {
      label: "Invoices",
      value: summary.totalInvoices,
      helper: `${summary.overdueInvoices} overdue`,
      icon: <CircleDollarSign className="h-4 w-4" />,
    },
    {
      label: "Revenue Collected",
      value: formatMoney(summary.totalRevenue),
      helper: `${formatMoney(summary.pendingRevenue)} pending`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="surface spotlight rounded-2xl p-5 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[var(--font-space)] text-2xl font-semibold text-[#f5fbff]">Freelancer Flow Analytics</h2>
            <p className="mt-1 text-sm text-[#cae7ff]/75">Track your actual pipeline from leads to paid invoices in one loop.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#88d5ff]/28 bg-[#0f2f4e]/75 px-3 py-1.5 text-xs font-semibold text-[#9edbff]">
            <Target className="h-3.5 w-3.5" /> One OS workflow
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-5">
          {pipeline.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              layout
              className="rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] p-3"
            >
              <div className="mb-2 flex items-center justify-between text-[#8fd8ff]">
                {step.icon}
                {index < pipeline.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-[#8ccfff]/60" />}
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#9dccf1]">{step.label}</p>
              <p className="mt-1 font-[var(--font-space)] text-xl font-semibold text-[#f5fbff]">
                {isLoading ? "..." : step.value}
              </p>
              <p className="mt-1 text-xs text-[#cae7ff]/72">{step.helper}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="surface rounded-2xl p-5">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">Money Snapshot</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5">
              <span className="text-[#c8e6ff]">Total Billed</span>
              <span className="font-semibold text-[#f5fbff]">{formatMoney(summary.totalBilled)}</span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring}
              className="flex items-center justify-between rounded-xl border border-[#8cf3be]/25 bg-[#17422e]/55 px-3 py-2.5"
            >
              <span className="text-[#d4ffe7]">Collected Revenue</span>
              <span className="font-[var(--font-space)] text-xl font-semibold text-[#8ef0be]">{formatMoney(summary.totalRevenue)}</span>
            </motion.div>
            <div className="flex items-center justify-between rounded-xl border border-[#ffd16d]/25 bg-[#4f3a13]/55 px-3 py-2.5">
              <span className="text-[#ffe2a3]">Pending Collection</span>
              <span className="font-semibold text-[#ffe2a3]">{formatMoney(summary.pendingRevenue)}</span>
            </div>
          </div>
        </article>

        <article className="surface rounded-2xl p-5">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">Execution Health</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5">
              <span className="text-[#c8e6ff]">Total Projects</span>
              <span className="font-semibold text-[#f5fbff]">{summary.totalProjects}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5">
              <span className="text-[#c8e6ff]">Completed Projects</span>
              <span className="font-semibold text-[#f5fbff]">{summary.completedProjects}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5">
              <span className="text-[#c8e6ff]">Completion Rate</span>
              <span className="font-semibold text-[#f5fbff]">{completionRate}%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#ff9a9a]/25 bg-[#3e1f27]/55 px-3 py-2.5">
              <span className="text-[#ffd0d0]">Overdue Invoices</span>
              <span className="font-semibold text-[#ffc3c3]">{summary.overdueInvoices}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
