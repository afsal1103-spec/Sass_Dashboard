"use client";

import { motion } from "framer-motion";

export default function InvoicesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="h-10 flex-1 rounded-lg bg-white/5 animate-pulse border border-white/10" />
          <div className="h-10 w-32 rounded-lg bg-white/5 animate-pulse border border-white/10" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-white/20 animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
      </div>

      {/* Grid for invoice cards or table skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((row) => (
                <tr key={row} className="border-b border-white/5">
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-white/15 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
                      <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-24 rounded bg-white/20 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
                      <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
