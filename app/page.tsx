"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, CreditCard, Layout, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span className="text-white/60">Powered by AI Analytics</span>
          </div>

          <h1 className="max-w-4xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
            The Intelligent OS for Modern Freelancers
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-white/60">
            Manage clients, track projects, and generate smart invoices with AI-powered proposals. All in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
            >
              Start Building <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid w-full max-w-6xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              icon: <Layout className="h-5 w-5" />,
              title: "Project Tracking",
              desc: "Manage all your projects in one place.",
            },
            {
              icon: <CreditCard className="h-5 w-5" />,
              title: "Smart Invoicing",
              desc: "Get paid faster with automated invoices.",
            },
            {
              icon: <Bot className="h-5 w-5" />,
              title: "AI Proposals",
              desc: "Write winning proposals in seconds.",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Analytics",
              desc: "Deep insights into your freelance business.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/80 group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-medium">{feature.title}</h3>
              <p className="text-sm text-white/40">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
