"use client";

import { motion } from "framer-motion";
import { Download, MoreVertical, Plus, Search } from "lucide-react";

const invoices = [
  { id: "INV-001", client: "GitHub", date: "Apr 15, 2026", status: "Paid", amount: "$2,200" },
  { id: "INV-002", client: "Supabase", date: "Apr 18, 2026", status: "Overdue", amount: "$1,800" },
  { id: "INV-003", client: "Stripe", date: "Apr 22, 2026", status: "Pending", amount: "$5,500" },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm focus:border-white/20 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
          <Plus className="h-4 w-4" /> Create Invoice
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 font-medium text-white/60">Invoice ID</th>
              <th className="px-6 py-4 font-medium text-white/60">Client</th>
              <th className="px-6 py-4 font-medium text-white/60">Due Date</th>
              <th className="px-6 py-4 font-medium text-white/60">Amount</th>
              <th className="px-6 py-4 font-medium text-white/60">Status</th>
              <th className="px-6 py-4 font-medium text-white/60"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {invoices.map((invoice, i) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-white/5 transition-all"
              >
                <td className="px-6 py-4 font-medium">{invoice.id}</td>
                <td className="px-6 py-4 text-white/60">{invoice.client}</td>
                <td className="px-6 py-4 text-white/60">{invoice.date}</td>
                <td className="px-6 py-4 font-medium">{invoice.amount}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    invoice.status === "Paid" ? "bg-green-500/10 text-green-400" : 
                    invoice.status === "Overdue" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/40"
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
