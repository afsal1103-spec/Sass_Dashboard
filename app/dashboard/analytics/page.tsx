"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

const monthlyIncome = [42, 58, 64, 72, 61, 77, 83, 90, 86, 98, 104, 112];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="surface spotlight rounded-2xl p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[var(--font-space)] text-2xl font-semibold text-[#f5fbff]">Income Analytics</h2>
            <p className="mt-1 text-sm text-[#cae7ff]/75">Revenue pattern across the year with growth indicators.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#88d5ff]/28 bg-[#0f2f4e]/75 px-3 py-1.5 text-xs font-semibold text-[#9edbff]">
            <TrendingUp className="h-3.5 w-3.5" /> +18% YoY Growth
          </div>
        </div>

        <div className="flex h-64 items-end gap-2">
          {monthlyIncome.map((point, i) => (
            <motion.div
              key={i}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${point}%`, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.55 }}
              className="group relative flex-1 rounded-t-md bg-gradient-to-t from-[#16527f] via-[#3798d2] to-[#91e0ff]"
            >
              <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-[#04162c] px-1.5 py-0.5 text-[10px] font-semibold text-[#dff4ff] opacity-0 transition group-hover:opacity-100">
                ${(point * 120).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-12 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9dccf1]/70">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <article className="surface rounded-2xl p-5">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">Top Clients by Revenue</h3>
          <div className="mt-4 space-y-3">
            {[
              { name: "Acme Corp", revenue: "$12,400", change: "+15%", up: true },
              { name: "Vercel", revenue: "$8,200", change: "+8%", up: true },
              { name: "GitHub", revenue: "$5,500", change: "-2%", up: false },
              { name: "Stripe", revenue: "$4,800", change: "+12%", up: true },
            ].map((client) => (
              <div key={client.name} className="flex items-center justify-between rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8ccfff]/30 bg-[#114069] text-xs font-semibold text-[#ddf3ff]">
                    {client.name[0]}
                  </div>
                  <span className="text-sm font-medium text-[#eaf7ff]">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#eaf7ff]">{client.revenue}</p>
                  <div className={`inline-flex items-center gap-1 text-[10px] font-semibold ${client.up ? "text-[#8ef0be]" : "text-[#ffb3b3]"}`}>
                    {client.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {client.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface rounded-2xl p-5">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">Profit Breakdown</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5">
              <span className="text-[#c8e6ff]">Gross Revenue</span>
              <span className="font-semibold text-[#f5fbff]">$32,400</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#ff9a9a]/25 bg-[#3e1f27]/55 px-3 py-2.5">
              <span className="text-[#ffd0d0]">Tax Estimate (20%)</span>
              <span className="font-semibold text-[#ffc3c3]">-$6,480</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#ff9a9a]/25 bg-[#3e1f27]/55 px-3 py-2.5">
              <span className="text-[#ffd0d0]">Software Expenses</span>
              <span className="font-semibold text-[#ffc3c3]">-$1,200</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#8cf3be]/25 bg-[#17422e]/55 px-3 py-2.5">
              <span className="font-semibold text-[#d4ffe7]">Net Profit</span>
              <span className="font-[var(--font-space)] text-xl font-semibold text-[#8ef0be]">$24,720</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
