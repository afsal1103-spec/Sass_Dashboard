"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Clipboard,
  FileDown,
  Save,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "@/lib/axios";

const proposalTemplates = [
  {
    label: "Landing Page Sprint",
    project: "Conversion-focused landing page",
    goal: "Increase inbound leads and improve ad conversion rates.",
    features: "Responsive UI\nCMS integration\nSEO setup\nAnalytics events",
  },
  {
    label: "SaaS Dashboard Build",
    project: "Admin dashboard for SaaS operations",
    goal: "Give operations teams one source of truth with role-based access.",
    features: "Role-based auth\nReporting charts\nBilling integration\nAudit logs",
  },
  {
    label: "Brand + Website Refresh",
    project: "Brand refresh and marketing website",
    goal: "Modernize positioning and improve conversion from website traffic.",
    features: "Brand identity updates\nDesign system\nNext.js build\nPerformance optimization",
  },
];

type PricingModel = "Fixed" | "Milestone" | "Retainer";
type ProposalMode = "proposal" | "idea" | "workflow";

interface Client {
  id: number;
  name: string;
}

interface Project {
  id: number;
  title: string;
  client?: Client;
}

interface SavedProposal {
  id: number;
  title: string;
  purpose?: string;
  createdAt?: string;
  status?: string;
}

function estimateBudget(model: PricingModel, featuresCount: number) {
  const base = 1200 + featuresCount * 750;
  if (model === "Milestone") return `${base.toLocaleString()} - ${(base + 2200).toLocaleString()} USD`;
  if (model === "Retainer") return `${Math.round(base * 0.38).toLocaleString()} USD / month`;
  return `${base.toLocaleString()} - ${(base + 1400).toLocaleString()} USD`;
}

const modeLabels: Record<ProposalMode, string> = {
  proposal: "Proposal",
  idea: "Project Idea",
  workflow: "Workflow Builder",
};

export default function ProposalsPage() {
  const [mode, setMode] = useState<ProposalMode>("proposal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [features, setFeatures] = useState("");
  const [timeline, setTimeline] = useState("4-6 weeks");
  const [pricingModel, setPricingModel] = useState<PricingModel>("Milestone");
  const [notes, setNotes] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedItems, setSavedItems] = useState<SavedProposal[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("openrouter/auto");
  const spring = { type: "spring", stiffness: 320, damping: 24 };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cachedKey = localStorage.getItem("proposal_openrouter_key");
    const cachedModel = localStorage.getItem("proposal_openrouter_model");
    if (cachedKey) setApiKey(cachedKey);
    if (cachedModel) setModel(cachedModel);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, projectsRes, proposalsRes] = await Promise.all([
          axios.get("/clients").catch(() => ({ data: [] })),
          axios.get("/projects").catch(() => ({ data: [] })),
          axios.get("/proposals").catch(() => ({ data: [] })),
        ]);

        setClients(clientsRes.data || []);
        setProjects(projectsRes.data || []);
        setSavedItems(proposalsRes.data || []);
      } catch (error: any) {
        toast.error(error.response?.data || "Failed to load proposal workspace");
      }
    };

    fetchData();
  }, []);

  const featureCount = useMemo(
    () =>
      features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean).length,
    [features],
  );

  const budget = estimateBudget(pricingModel, Math.max(1, featureCount));

  const handleGenerate = async () => {
    if (!projectName || !features) {
      toast.error("Please fill project name and requirements first.");
      return;
    }
    if (!apiKey.trim()) {
      toast.error("Add your OpenRouter API key to use real AI generation.");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating with AI...");

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("proposal_openrouter_key", apiKey.trim());
        localStorage.setItem("proposal_openrouter_model", model.trim());
      }

      const response = await axios.post("/proposals/generate", {
        mode,
        projectName,
        clientName,
        businessGoal,
        features,
        timeline,
        pricingModel,
        budget,
        purposeNotes: notes,
        apiKey: apiKey.trim(),
        model: model.trim(),
      });

      setGeneratedContent(response.data?.content || "");
      toast.success(`${modeLabels[mode]} generated`, { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data || "AI generation failed", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = (index: number) => {
    const template = proposalTemplates[index];
    setProjectName(template.project);
    setBusinessGoal(template.goal);
    setFeatures(template.features);
    toast.success(`Applied template: ${template.label}`);
  };

  const copyContent = async () => {
    if (!generatedContent) {
      toast.error("Generate content first.");
      return;
    }
    await navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard.");
  };

  const exportContent = () => {
    if (!generatedContent) {
      toast.error("Generate content first.");
      return;
    }

    const blob = new Blob([generatedContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName || "generated"}-${mode}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported as markdown.");
  };

  const saveToWorkspace = async () => {
    if (!generatedContent) {
      toast.error("Generate content first.");
      return;
    }
    if (!selectedClientId && !selectedProjectId) {
      toast.error("Select a client or project before saving.");
      return;
    }

    const loadingToast = toast.loading("Saving to workspace...");
    try {
      await axios.post("/proposals", {
        title: `${modeLabels[mode]} - ${projectName || "Untitled"}`,
        content: generatedContent,
        clientId: selectedClientId ? Number(selectedClientId) : null,
        projectId: selectedProjectId ? Number(selectedProjectId) : null,
        status: "DRAFT",
        purpose: mode.toUpperCase(),
      });

      const proposalsRes = await axios.get("/proposals");
      setSavedItems(proposalsRes.data || []);
      toast.success("Saved to your workspace", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to save", { id: loadingToast });
    }
  };

  const selectedClientProjects = useMemo(
    () => projects.filter((project) => (selectedClientId ? project.client?.id?.toString() === selectedClientId : true)),
    [projects, selectedClientId],
  );

  return (
    <div className="space-y-6">
      <section className="surface rounded-2xl p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-[var(--font-space)] text-xl font-semibold text-[#f4fbff]">AI Proposal Studio</h2>
            <p className="mt-1 text-sm text-[#cae7ff]/76">
              One workspace for proposals, project ideas, and execution workflows with real AI output.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {proposalTemplates.map((template, index) => (
              <motion.button
                key={template.label}
                onClick={() => applyTemplate(index)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
                className="rounded-full border border-[#8ccfff]/24 bg-[#0d2743] px-3 py-1.5 text-xs font-semibold text-[#daf0ff] transition hover:border-[#8ccfff]/45"
              >
                {template.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["proposal", "idea", "workflow"] as ProposalMode[]).map((item) => (
            <motion.button
              key={item}
              onClick={() => setMode(item)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                mode === item
                  ? "bg-[#ffd16d] text-[#132a42]"
                  : "border border-[#8ccfff]/24 bg-[#0d2743] text-[#daf0ff] hover:border-[#8ccfff]/45"
              }`}
            >
              {modeLabels[item]}
            </motion.button>
          ))}
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

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Business Goal</label>
              <input
                type="text"
                value={businessGoal}
                onChange={(event) => setBusinessGoal(event.target.value)}
                placeholder="e.g. Increase paid conversions"
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
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Requirements (one per line)</label>
              <textarea
                rows={6}
                value={features}
                onChange={(event) => setFeatures(event.target.value)}
                placeholder="Client dashboard\nPayment integration\nEmail notifications"
                className="w-full resize-none rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9dccf1]">Extra Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Any constraints, tone, or must-have points..."
                className="w-full resize-none rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              />
            </div>

            <div className="rounded-xl border border-[#ffd16d]/30 bg-[#4a3812]/55 p-3 text-xs text-[#ffe2a3]">
              Estimated budget: <span className="font-semibold">{budget}</span>
            </div>

            <div className="rounded-xl border border-[#8ccfff]/30 bg-[#0f2b48] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9dccf1]">AI Setup (Bring Your Key)</p>
              <div className="mt-2 space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="OpenRouter API key"
                  className="w-full rounded-lg border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2 text-xs text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                />
                <input
                  type="text"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Model (example: deepseek/deepseek-r1:free)"
                  className="w-full rounded-lg border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2 text-xs text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                />
                <p className="text-[11px] text-[#cde8ff]/70">
                  Key is stored only in your browser local storage and used only when you click generate.
                </p>
              </div>
            </div>

            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd16d] px-4 py-2.5 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : `Generate ${modeLabels[mode]}`}
            </motion.button>
          </div>
        </article>

        <article className="surface rounded-2xl p-4 md:p-5 xl:col-span-2">
          <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-[520px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#8ccfff]/35 bg-[#0b253f]/55"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="rounded-full border border-[#8ccfff]/30 bg-[#0e2f50] p-4"
              >
                <Bot className="h-7 w-7 text-[#9edbff]" />
              </motion.div>
              <p className="text-sm text-[#cae7ff]/80">Generating real AI output for your {modeLabels[mode].toLowerCase()}...</p>
            </motion.div>
          ) : generatedContent ? (
            <motion.div
              key="generated"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f5fbff]">Generated {modeLabels[mode]}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyContent}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-1.5 text-xs font-semibold text-[#d9efff]"
                  >
                    <Clipboard className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button
                    onClick={exportContent}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-1.5 text-xs font-semibold text-[#d9efff]"
                  >
                    <FileDown className="h-3.5 w-3.5" /> Export
                  </button>
                  <button
                    onClick={saveToWorkspace}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-1.5 text-xs font-semibold text-[#d9efff]"
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button
                    onClick={copyContent}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4cc9f0] px-3 py-1.5 text-xs font-semibold text-[#09233d]"
                  >
                    <Send className="h-3.5 w-3.5" /> Use
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={selectedClientId}
                  onChange={(event) => {
                    setSelectedClientId(event.target.value);
                    setSelectedProjectId("");
                  }}
                  className="rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-2 text-xs text-[#d9efff] outline-none focus:border-[#8ccfff]/55"
                >
                  <option value="">Link to client (optional)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="rounded-lg border border-[#8ccfff]/30 bg-[#0d2b49] px-3 py-2 text-xs text-[#d9efff] outline-none focus:border-[#8ccfff]/55"
                >
                  <option value="">Link to project (optional)</option>
                  {selectedClientProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <pre className="min-h-[420px] whitespace-pre-wrap rounded-xl border border-[#8ccfff]/25 bg-[#0c2641]/72 p-4 text-sm leading-relaxed text-[#e9f6ff]">
                {generatedContent}
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-dashed border-[#8ccfff]/30 bg-[#0b253f]/52 px-4 text-center"
            >
              <WandSparkles className="h-12 w-12 text-[#8fd8ff]/80" />
              <p className="mt-3 font-[var(--font-space)] text-lg font-semibold text-[#edf7ff]">Build a winning first draft in seconds</p>
              <p className="mt-1 max-w-md text-sm text-[#cae7ff]/70">
                Choose your mode, add your own API key, and generate practical freelancer-ready output.
              </p>
            </motion.div>
          )}
          </AnimatePresence>
        </article>
      </section>

      <section className="surface rounded-2xl p-4">
        <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f4fbff]">Saved In Workspace</h3>
        <div className="mt-3 space-y-2">
          {savedItems.length === 0 ? (
            <p className="text-sm text-[#cae7ff]/75">No saved proposals or workflow documents yet.</p>
          ) : (
            savedItems.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-[#8ccfff]/22 bg-[#0c2742] px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-[#eaf7ff]">{item.title}</p>
                <p className="text-xs text-[#cae7ff]/72">
                  {(item.purpose || "PROPOSAL").toUpperCase()} | {item.status || "DRAFT"}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

