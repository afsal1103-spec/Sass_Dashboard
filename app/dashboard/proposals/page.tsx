"use client";

import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ProposalsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mocking AI generation
    setTimeout(() => {
      setProposal(`
# Project Proposal: SaaS Dashboard Development

## Overview
This proposal outlines the development of a modern, high-performance SaaS dashboard tailored for freelancers and small teams.

## Scope of Work
1. **Frontend Development**: Next.js, Tailwind CSS, Framer Motion.
2. **Backend Integration**: Spring Boot API, PostgreSQL.
3. **AI Features**: Proposal generation, automated insights.
4. **Payment System**: Stripe integration for seamless invoicing.

## Timeline
Total duration: 4 weeks.

## Budget
Estimated cost: $5,000.
      `);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI Proposal Generator</h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Input Controls */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-bold text-white/60">Project Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Brand Redesign"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-white/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-white/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Key Features</label>
                <textarea
                  rows={4}
                  placeholder="Describe the main features..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-white/20 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Editor Preview */}
        <div className="lg:col-span-2">
          <div className="h-full min-h-[500px] rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {isGenerating ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="h-10 w-10 text-white/40" />
                  </motion.div>
                  <p className="text-sm text-white/40 animate-pulse">AI is crafting your proposal...</p>
                </div>
              </div>
            ) : proposal ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none"
              >
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                  {proposal}
                </pre>
                <div className="mt-10 flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                    <Send className="h-4 w-4" /> Send to Client
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
                <div className="text-center">
                  <Bot className="mx-auto h-12 w-12 text-white/10" />
                  <p className="mt-4 text-sm text-white/20">Fill in the details and click generate to see the magic.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
