"use client";

import { motion } from "framer-motion";
import { BarChart3, Briefcase, CreditCard, Users } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$12,450", change: "+12.5%", icon: <CreditCard className="h-5 w-5" /> },
  { label: "Active Projects", value: "8", change: "+2", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Total Clients", value: "15", change: "+4", icon: <Users className="h-5 w-5" /> },
  { label: "Project Success", value: "98%", change: "+2%", icon: <BarChart3 className="h-5 w-5" /> },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/80 group-hover:text-white transition-all">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-green-400">{stat.change}</span>
            </div>
            <p className="text-sm font-medium text-white/40">{stat.label}</p>
            <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity / Projects */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-bold">Recent Projects</h3>
          <div className="space-y-4">
            {[
              { name: "Brand Redesign", client: "Acme Corp", status: "In Progress", amount: "$4,500" },
              { name: "SaaS Dashboard", client: "Vercel", status: "Completed", amount: "$8,000" },
              { name: "Mobile App", client: "Linear", status: "On Hold", amount: "$12,000" },
            ].map((project, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-xs text-white/40">{project.client}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{project.amount}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    project.status === "Completed" ? "text-green-400" : 
                    project.status === "In Progress" ? "text-blue-400" : "text-yellow-400"
                  }`}>{project.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-bold">Upcoming Invoices</h3>
          <div className="space-y-4">
            {[
              { id: "INV-001", client: "GitHub", date: "Apr 15, 2026", status: "Pending", amount: "$2,200" },
              { id: "INV-002", client: "Supabase", date: "Apr 18, 2026", status: "Overdue", amount: "$1,800" },
              { id: "INV-003", client: "Stripe", date: "Apr 22, 2026", status: "Pending", amount: "$5,500" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-medium">{invoice.id}</h4>
                  <p className="text-xs text-white/40">{invoice.client} • {invoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{invoice.amount}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    invoice.status === "Overdue" ? "text-red-400" : "text-yellow-400"
                  }`}>{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
