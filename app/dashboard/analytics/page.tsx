"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Revenue Chart Section (Visual Only for now) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Income Analytics</h2>
            <p className="text-sm text-white/40 tracking-tight mt-1">Total revenue generated this year</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            +18% from last year
          </div>
        </div>

        {/* Mock Chart Visualization */}
        <div className="flex h-64 items-end gap-3 px-2">
          {[40, 60, 45, 90, 65, 50, 85, 45, 75, 95, 60, 80].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500/20 to-blue-500 group relative transition-all hover:to-white"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold">
                ${height * 100}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20 px-2">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Clients by Revenue */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-bold">Top Clients</h3>
          <div className="space-y-4">
            {[
              { name: "Acme Corp", revenue: "$12,400", change: "+15%", up: true },
              { name: "Vercel", revenue: "$8,200", change: "+8%", up: true },
              { name: "GitHub", revenue: "$5,500", change: "-2%", up: false },
              { name: "Stripe", revenue: "$4,800", change: "+12%", up: true },
            ].map((client, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs">
                    {client.name[0]}
                  </div>
                  <span className="font-medium">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{client.revenue}</p>
                  <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${
                    client.up ? "text-green-400" : "text-red-400"
                  }`}>
                    {client.up ? <ArrowUp className="h-2 w-2" /> : <ArrowDown className="h-2 w-2" />}
                    {client.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses/Net Profit Mockup */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-bold">Profit Breakdown</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Gross Revenue</span>
              <span className="text-sm font-bold">$32,400</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Tax Estimate (20%)</span>
              <span className="text-sm font-bold text-red-400">-$6,480</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Software Expenses</span>
              <span className="text-sm font-bold text-red-400">-$1,200</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-bold">Net Profit</span>
              <span className="text-xl font-bold text-green-400">$24,720</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
