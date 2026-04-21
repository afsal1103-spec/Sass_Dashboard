"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="h-10 flex-1 rounded-lg bg-[#8ccfff]/10 animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-[#8ccfff]/10 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-[#8ccfff]/20 animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
      </div>

      {/* Grid for content skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="h-48 rounded-2xl border border-[#8ccfff]/10 bg-[#08172a]/40 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#8ccfff]/15 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-[#8ccfff]/10 animate-pulse" />
                <div className="h-4 w-32 rounded bg-[#8ccfff]/20 animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full rounded bg-[#8ccfff]/5 animate-pulse" />
              <div className="h-2 w-full rounded bg-[#8ccfff]/5 animate-pulse" />
              <div className="h-2 w-2/3 rounded bg-[#8ccfff]/5 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
