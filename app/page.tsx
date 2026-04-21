"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CreditCard,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Client CRM",
    desc: "Track leads, relationship health, and follow-ups in one workspace.",
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    title: "Project Pipeline",
    desc: "Plan delivery, avoid deadline surprises, and keep scope visible.",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Invoice Control",
    desc: "See paid, pending, and overdue invoices with quick actions.",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Proposals",
    desc: "Generate client-ready proposals with timeline and pricing blocks.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-16 pt-8 text-[#ecf2ff] sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-45" />

      <section className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="surface spotlight overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-12"
        >
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#4cc9f0]/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-[#ffb703]/15 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0a111a] px-3.5 py-1.5 text-xs font-medium text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4cc9f0]" /> Powered by AI Analytics
            </div>

            <h1 className="max-w-4xl font-[var(--font-space)] text-5xl font-semibold leading-[1.1] text-white sm:text-6xl lg:text-7xl">
              The Intelligent OS for <br className="hidden sm:block" />
              <span className="text-white/40">Modern Freelancers</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base text-[#cae7ff]/60 sm:text-lg">
              Manage clients, track projects, and generate smart invoices with AI-powered proposals. All in one place.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                Start Building <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161b22] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#1c2128] active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature) => (
            <article key={feature.title} className="surface soft-glow rounded-2xl p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#8ccfff]/30 bg-[#10395e] text-[#8fd8ff]">
                {feature.icon}
              </span>
              <h3 className="mt-3 font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">{feature.title}</h3>
              <p className="mt-1 text-sm text-[#cae7ff]/78">{feature.desc}</p>
            </article>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
