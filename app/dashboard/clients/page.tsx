"use client";

import { motion } from "framer-motion";
import { Mail, MoreVertical, Phone, Plus, Search } from "lucide-react";

const clients = [
  { name: "Afsal", email: "afsal@example.com", company: "Freelance", projects: 3, status: "Active" },
  { name: "Sarah Chen", email: "sarah@design.co", company: "DesignCo", projects: 1, status: "Active" },
  { name: "Mike Ross", email: "mike@pearson.com", company: "Pearson Hardman", projects: 5, status: "Inactive" },
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm focus:border-white/20 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 font-medium text-white/60">Client</th>
              <th className="px-6 py-4 font-medium text-white/60">Company</th>
              <th className="px-6 py-4 font-medium text-white/60">Projects</th>
              <th className="px-6 py-4 font-medium text-white/60">Status</th>
              <th className="px-6 py-4 font-medium text-white/60"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {clients.map((client, i) => (
              <motion.tr
                key={client.email}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-white/5 transition-all"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-white/40">{client.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/60">{client.company}</td>
                <td className="px-6 py-4 text-white/60">{client.projects}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    client.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/40"
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
