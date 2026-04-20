"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Clipboard,
  FileDown,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const proposalTemplates = [
  {
    label: "Landing Page Sprint",
    project: "Conversion-focused landing page",
    features: "Responsive UI\nCMS integration\nSEO setup\nAnalytics events",
  },
  {
    label: "SaaS Dashboard Build",
    project: "Admin dashboard for SaaS operations",
    features: "Role-based auth\nReporting charts\nBilling integration\nAudit logs",
  },
  {
    label: "Brand + Website Refresh",
    project: "Brand refresh and marketing website",
    features: "Brand identity updates\nDesign system\nWebflow or Next.js build\nPerformance optimization",
  },
];

type PricingModel = "Fixed" | "Milestone" | "Retainer";

function estimateBudget(model: PricingModel, featuresCount: number) {
  const base = 1200 + featuresCount * 750;
  if (model === "Milestone") return `${base.toLocaleString()} - ${(base + 2200).toLocaleString()} USD`;
  if (model === "Retainer") return `${Math.round(base * 0.38).toLocaleString()} USD / month`;
  return `${base.toLocaleString()} - ${(base + 1400).toLocaleString()} USD`;
}

export default function ProposalsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [features, setFeatures] = useState("");
  const [timeline, setTimeline] = useState("4-6 weeks");
  const [pricingModel, setPricingModel] = useState<PricingModel>("Milestone");

  const featureCount = useMemo(
    () =>
      features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean).length,
    [features],
  );

  const budget = estimateBudget(pricingModel, Math.max(1, featureCount));

  const handleGenerate = () => {
    if (!projectName || !clientName || !features) {
      toast.error("Please fill in project name, client, and features.");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const list = features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n");

      setProposal(`# Project Proposal: ${projectName}

## Prepared For
${clientName}

## Objective
Deliver a high-quality ${projectName.toLowerCase()} that supports measurable business growth and smooth handoff.

## Scope
${list}

## Delivery Model
${pricingModel} engagement with clear checkpoints, weekly updates, and transparent communication.

## Timeline
Estimated timeline: ${timeline}

## Investment
Estimated budget: ${budget}

## Why This Approach
- Fast delivery while protecting quality
- Predictable milestones and feedback loops
- Built for scale and long-term maintainability

## Next Steps
1. Confirm scope and success criteria.
2. Approve engagement model.
3. Kickoff within 2 business days.
`);

      setIsGenerating(false);
      toast.success("Proposal generated. Ready to send.");
    }, 1400);
  };

  const applyTemplate = (index: number) => {
    const template = proposalTemplates[index];
    setProjectName(template.project);
    setFeatures(template.features);
    toast.success(`Applied template: ${template.label}`);
  };

  const copyProposal = async () => {
    if (!proposal) {
      toast.error("Generate a proposal first.");
      return;
    }

    await navigator.clipboard.writeText(proposal);
    toast.success("Proposal copied to clipboard.");
  };

  return (
    <div className="space-y-6">
      <section className="surface rounded-2xl p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-[var(--font-space)] text-xl font-semibold text-[#f4fbff]">AI Proposal Studio</h2>
            <p className="mt-1 text-sm text-[#cae7ff]/76">Create polished proposals that close faster without rewriting from scratch.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {proposalTemplates.map((template, index) => (
              <button
                key={template.label}
                onClick={() => applyTemplate(index)}
                className="rounded-full border border-[#8ccfff]/24 bg-[#0d2743] px-3 py-1.5 text-xs font-semibold text-[#daf0ff] transition hover:border-[#8ccfff]/45"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="surface rounded-2xl p-4 md:p-5 xl:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="e.g. SaaS Client Portal"
                className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="e.g. Acme Labs"
                className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Timeline</label>
                <input
                  type="text"
                  value={timeline}
                  onChange={(event) => setTimeline(event.target.value)}
                  className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Pricing</label>
                <select
                  value={pricingModel}
                  onChange={(event) => setPricingModel(event.target.value as PricingModel)}
                  className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
                >
                  <option>Fixed</option>
                  <option>Milestone</option>
                  <option>Retainer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Key Features (one per line)</label>
              <textarea
                rows={7}
                value={features}
                onChange={(event) => setFeatures(event.target.value)}
                placeholder="Client dashboard\nPayment integration\nEmail notifications"
                className="w-full resize-none rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              />
            </div>

            <div className="rounded-xl border border-[#ffd16d]/30 bg-[#4a3812]/55 p-3 text-xs text-[#ffe2a3]">
              Estimated budget: <span className="font-semibold">{budget}</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd16d] px-4 py-2.5 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Proposal"}
            </button>
          </div>
        </article>

        <article className="surface rounded-2xl p-4 md:p-5 xl:col-span-2">
          {isGenerating ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#8ccfff]/35 bg-[#0b253f]/55">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="rounded-full border border-[#8ccfff]/30 bg-[#0e2f50] p-4"
              >
                <Bot className="h-7 w-7 text-[#9edbff]" />
              </motion.div>
              <p className="text-sm text-[#cae7ff]/80">Crafting a concise, client-ready proposal...</p>
            </div>
          ) : proposal ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">Generated Proposal</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyProposal}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-1.5 text-xs font-semibold text-[#d9efff]"
                  >
                    <Clipboard className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-1.5 text-xs font-semibold text-[#d9efff]">
                    <FileDown className="h-3.5 w-3.5" /> Export
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-[#4cc9f0] px-3 py-1.5 text-xs font-semibold text-[#09233d]">
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                </div>
              </div>

              <pre className="min-h-[460px] whitespace-pre-wrap rounded-xl border border-[#8ccfff]/25 bg-[#0c2641]/72 p-4 text-sm leading-relaxed text-[#e9f6ff]">
                {proposal}
              </pre>
            </div>
          ) : (
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-[#8ccfff]/30 bg-[#0b253f]/52 px-4 text-center">
              <WandSparkles className="h-12 w-12 text-[#8fd8ff]/80" />
              <p className="mt-3 font-[var(--font-space)] text-lg font-semibold text-[#edf7ff]">Build a winning first draft in seconds</p>
              <p className="mt-1 max-w-md text-sm text-[#cae7ff]/70">
                Fill in your project details and click generate. You can copy the result directly into email, Notion, or your client portal.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
