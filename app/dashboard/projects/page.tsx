"use client";

import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";

const projects = [
  { name: "Brand Redesign", client: "Acme Corp", status: "In Progress", amount: "$4,500" },
  { name: "SaaS Dashboard", client: "Vercel", status: "Completed", amount: "$8,000" },
  { name: "Mobile App", client: "Linear", status: "On Hold", amount: "$12,000" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm focus:border-white/20 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                project.status === "Completed" ? "bg-green-500/10 text-green-400" : 
                project.status === "In Progress" ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-white/40"
              }`}>
                {project.status}
              </span>
              <span className="text-sm font-medium">{project.amount}</span>
            </div>
            <h3 className="mb-2 font-bold group-hover:text-white">{project.name}</h3>
            <p className="mb-6 text-xs text-white/40">{project.client}</p>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full bg-blue-500 ${
                project.status === "Completed" ? "w-full" : 
                project.status === "In Progress" ? "w-1/2" : "w-1/4"
              }`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
