"use client";

import { motion } from "framer-motion";

export default function ProposalsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="h-10 flex-1 rounded-lg bg-white/5 animate-pulse border border-white/10" />
        </div>
        <div className="h-10 w-44 rounded-lg bg-white/20 animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
      </div>

      {/* Grid for proposal items skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="h-64 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="h-10 w-10 rounded-xl bg-white/15 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="h-5 w-3/4 rounded bg-white/20 animate-pulse" />
              <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-white/10 animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
