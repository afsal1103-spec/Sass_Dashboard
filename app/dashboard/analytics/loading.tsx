"use client";

import { motion } from "framer-motion";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Chart Skeleton Card */}
      <section className="surface spotlight rounded-2xl p-5 md:p-6 border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-white/20 animate-pulse" />
            <div className="h-4 w-64 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="h-8 w-32 rounded-full bg-white/15 animate-pulse" />
        </div>

        <div className="flex h-64 items-end gap-2 px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              style={{ height: `${20 + Math.random() * 60}%` }}
              className="flex-1 rounded-t-md bg-white/10 animate-pulse transition-all"
            />
          ))}
        </div>

        <div className="mt-6 flex justify-between px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-3 w-10 rounded bg-white/5 animate-pulse" />
          ))}
        </div>
      </section>

      {/* Grid for small metrics skeleton cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <article key={i} className="surface rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="h-6 w-36 rounded bg-white/20 animate-pulse mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-14 w-full rounded-xl border border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
