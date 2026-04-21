"use client";

import { motion } from "framer-motion";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Search and Filters Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="h-10 flex-1 rounded-lg bg-white/5 animate-pulse border border-white/10" />
          <div className="h-10 w-32 rounded-lg bg-white/5 animate-pulse border border-white/10" />
          <div className="h-10 w-32 rounded-lg bg-white/5 animate-pulse border border-white/10" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-white/20 animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
      </div>

      {/* Grid for project cards skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="h-56 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="h-5 w-3/4 rounded bg-white/20 animate-pulse" />
              <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-white/10 animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/15 animate-pulse" />
                <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
