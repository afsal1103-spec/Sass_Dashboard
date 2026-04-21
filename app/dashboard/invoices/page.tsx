"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  Wallet,
  X,
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

interface Client {
  id: number;
  name: string;
  company?: string;
}

interface Project {
  id: number;
  title: string;
  client?: Client;
}

type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

interface Invoice {
  id: number;
  invoiceNumber: string;
  client: Client;
  project?: Project | null;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

const statusLabels: Record<InvoiceStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function normalizeStatus(value?: string): InvoiceStatus {
  const normalized = (value || "").toUpperCase();
  if (normalized === "PAID" || normalized === "OVERDUE" || normalized === "CANCELLED") {
    return normalized;
  }
  return "PENDING";
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [createStatus, setCreateStatus] = useState<InvoiceStatus>("PENDING");
  const spring = { type: "spring", stiffness: 320, damping: 24 };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invoicesRes, clientsRes, projectsRes] = await Promise.all([
        axios.get("/invoices").catch(() => ({ data: [] })),
        axios.get("/clients").catch(() => ({ data: [] })),
        axios.get("/projects").catch(() => ({ data: [] })),
      ]);

      setInvoices(invoicesRes.data || []);
      setClients(clientsRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to load invoice data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const invoiceStatus = normalizeStatus(invoice.status);
        const matchesSearch =
          invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
          invoice.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
          invoice.project?.title?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "all" || invoiceStatus.toLowerCase() === status;
        return matchesSearch && matchesStatus;
      }),
    [invoices, search, status],
  );

  const totals = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        const invoiceStatus = normalizeStatus(invoice.status);
        const invoiceAmount = Number(invoice.amount || 0);

        acc.total += invoiceAmount;
        if (invoiceStatus === "PAID") acc.paid += invoiceAmount;
        if (invoiceStatus === "PENDING") acc.pending += invoiceAmount;
        if (invoiceStatus === "OVERDUE") acc.overdue += invoiceAmount;
        return acc;
      },
      { total: 0, paid: 0, pending: 0, overdue: 0 },
    );
  }, [invoices]);

  const clientProjects = useMemo(
    () => projects.filter((project) => (clientId ? project.client?.id?.toString() === clientId : true)),
    [projects, clientId],
  );

  const resetForm = () => {
    setInvoiceNumber("");
    setClientId("");
    setProjectId("");
    setAmount("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setCreateStatus("PENDING");
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please add a valid amount");
      return;
    }
    if (!dueDate) {
      toast.error("Please select a due date");
      return;
    }

    const loadingToast = toast.loading("Creating invoice...");
    try {
      await axios.post("/invoices", {
        invoiceNumber: invoiceNumber || null,
        clientId: Number(clientId),
        projectId: projectId ? Number(projectId) : null,
        amount: Number(amount),
        issueDate,
        dueDate,
        status: createStatus,
      });

      toast.success("Invoice created", { id: loadingToast });
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to create invoice", { id: loadingToast });
    }
  };

  const handleDownload = (invoice: Invoice) => {
    const content = [
      `Invoice: ${invoice.invoiceNumber}`,
      `Client: ${invoice.client?.name || "-"}`,
      `Project: ${invoice.project?.title || "-"}`,
      `Issue Date: ${formatDate(invoice.issueDate)}`,
      `Due Date: ${formatDate(invoice.dueDate)}`,
      `Status: ${statusLabels[normalizeStatus(invoice.status)]}`,
      `Amount: ${formatMoney(Number(invoice.amount || 0))}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber || "invoice"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Total Billed", value: formatMoney(totals.total), tone: "text-[#f4fbff]" },
          { label: "Collected", value: formatMoney(totals.paid), tone: "text-[#86f0bb]" },
          { label: "Pending", value: formatMoney(totals.pending), tone: "text-[#ffd16d]" },
          { label: "Overdue", value: formatMoney(totals.overdue), tone: "text-[#ff9d9d]" },
        ].map((metric, index) => (
          <motion.article
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="surface rounded-2xl p-4"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#9dccf1]">{metric.label}</p>
            <p className={`mt-2 font-[var(--font-space)] text-2xl font-semibold ${metric.tone}`}>{metric.value}</p>
          </motion.article>
        ))}
      </section>

      <section className="surface rounded-2xl p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a5d8ff]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by invoice, client, or project"
                className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 py-2 pl-10 pr-3 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/50"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a5d8ff]" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 py-2 pl-10 pr-8 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/50"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <motion.button
            onClick={() => {
              if (clients.length === 0) {
                toast.error("Add a client first before creating invoices");
                return;
              }
              setIsCreateOpen(true);
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffd16d] px-4 py-2 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c]"
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </motion.button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-[#8ccfff]/18">
          <table className="w-full min-w-[660px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#8ccfff]/14 bg-[#0d2a46]/75 text-[#a9d9fb]">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#cce8ff]/70">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#cce8ff]/70">
                    No invoices found for current filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => {
                  const invoiceStatus = normalizeStatus(invoice.status);
                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ y: -1 }}
                      className="border-b border-[#8ccfff]/10 bg-[#0a2239]/65 hover:bg-[#0e2f4f]/80"
                    >
                      <td className="px-4 py-3 font-semibold text-[#edf7ff]">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-[#cce8ff]">{invoice.client?.name || "-"}</td>
                      <td className="px-4 py-3 text-[#cce8ff]">{formatDate(invoice.dueDate)}</td>
                      <td className="px-4 py-3 font-semibold text-[#edf7ff]">{formatMoney(Number(invoice.amount || 0))}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            invoiceStatus === "PAID"
                              ? "border border-[#86f0bb]/30 bg-[#1a5039]/55 text-[#a2f6cb]"
                              : invoiceStatus === "OVERDUE"
                                ? "border border-[#ff9d9d]/30 bg-[#4a1f2a]/60 text-[#ffc2c2]"
                                : invoiceStatus === "CANCELLED"
                                  ? "border border-[#c2cad1]/30 bg-[#2e3b4a]/60 text-[#d4dde6]"
                                  : "border border-[#ffd16d]/30 bg-[#4f3a13]/60 text-[#ffe2a3]"
                          }`}
                        >
                          {statusLabels[invoiceStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingInvoice(invoice)}
                            className="rounded-lg p-2 text-[#a7d7ff] transition hover:bg-[#12375b] hover:text-[#eef8ff]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(invoice)}
                            className="rounded-lg p-2 text-[#a7d7ff] transition hover:bg-[#12375b] hover:text-[#eef8ff]"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="surface rounded-2xl p-4">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f4fbff]">Cashflow Assistant</h3>
          <p className="mt-2 text-sm text-[#cae7ff]/78">
            You have <span className="font-semibold text-[#ffe2a3]">{formatMoney(totals.pending + totals.overdue)}</span> waiting to be collected.
          </p>
        </article>

        <article className="surface rounded-2xl p-4">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f4fbff]">Invoice Strategy</h3>
          <p className="mt-2 text-sm text-[#cae7ff]/78">Split large projects into milestone invoices to smooth your monthly income.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#8ccfff]/26 bg-[#0e2a46] px-3.5 py-2 text-xs text-[#d8efff]">
            <Wallet className="h-4 w-4 text-[#8fd8ff]" /> Best practice: 40/40/20 milestone structure
          </div>
        </article>
      </section>

      <AnimatePresence>
        {isCreateOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75"
            onClick={() => setIsCreateOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl rounded-2xl border border-[#8ccfff]/20 bg-[#0b1f35] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#eff8ff]">Create Invoice</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1.5 text-[#b8dbfa] transition hover:bg-[#123557]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="Invoice number (optional)"
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Amount"
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={clientId}
                  onChange={(event) => {
                    setClientId(event.target.value);
                    setProjectId("");
                  }}
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                >
                  <option value="">Select project (optional)</option>
                  {clientProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55 [color-scheme:dark]"
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55 [color-scheme:dark]"
                  required
                />
                <select
                  value={createStatus}
                  onChange={(event) => setCreateStatus(event.target.value as InvoiceStatus)}
                  className="rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/85 px-3 py-2.5 text-sm text-[#eff8ff] outline-none focus:border-[#8ccfff]/55"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full rounded-xl border border-[#8ccfff]/30 bg-[#102e4b] py-2.5 text-sm font-semibold text-[#d9efff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#ffd16d] py-2.5 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c]"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {viewingInvoice && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={() => setViewingInvoice(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-[#8ccfff]/20 bg-[#0c243d] p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#eff8ff]">Invoice Details</h3>
              <button
                onClick={() => setViewingInvoice(null)}
                className="rounded-lg p-1.5 text-[#b8dbfa] transition hover:bg-[#123557]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-[#d7ecff]">
              <p><span className="text-[#9dccf1]">Invoice:</span> {viewingInvoice.invoiceNumber}</p>
              <p><span className="text-[#9dccf1]">Client:</span> {viewingInvoice.client?.name || "-"}</p>
              <p><span className="text-[#9dccf1]">Project:</span> {viewingInvoice.project?.title || "-"}</p>
              <p><span className="text-[#9dccf1]">Issue Date:</span> {formatDate(viewingInvoice.issueDate)}</p>
              <p><span className="text-[#9dccf1]">Due Date:</span> {formatDate(viewingInvoice.dueDate)}</p>
              <p><span className="text-[#9dccf1]">Status:</span> {statusLabels[normalizeStatus(viewingInvoice.status)]}</p>
              <p><span className="text-[#9dccf1]">Amount:</span> {formatMoney(Number(viewingInvoice.amount || 0))}</p>
            </div>
            <button
              onClick={() => handleDownload(viewingInvoice)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffd16d] py-2.5 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c]"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
