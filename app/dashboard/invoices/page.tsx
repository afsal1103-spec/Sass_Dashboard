"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BellRing,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Wallet,
} from "lucide-react";

const invoices = [
  { id: "INV-001", client: "GitHub", date: "2026-04-15", status: "Paid", amount: 2200 },
  { id: "INV-002", client: "Supabase", date: "2026-04-18", status: "Overdue", amount: 1800 },
  { id: "INV-003", client: "Stripe", date: "2026-04-22", status: "Pending", amount: 5500 },
  { id: "INV-004", client: "Notion", date: "2026-04-26", status: "Pending", amount: 1250 },
  { id: "INV-005", client: "Linear", date: "2026-04-12", status: "Paid", amount: 3100 },
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesSearch =
          invoice.id.toLowerCase().includes(search.toLowerCase()) ||
          invoice.client.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "all" || invoice.status.toLowerCase() === status;

        return matchesSearch && matchesStatus;
      }),
    [search, status],
  );

  const totals = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.total += invoice.amount;
        if (invoice.status === "Paid") acc.paid += invoice.amount;
        if (invoice.status === "Pending") acc.pending += invoice.amount;
        if (invoice.status === "Overdue") acc.overdue += invoice.amount;
        return acc;
      },
      { total: 0, paid: 0, pending: 0, overdue: 0 },
    );
  }, []);

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
                placeholder="Search by invoice or client"
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
              </select>
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffd16d] px-4 py-2 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c]">
            <Plus className="h-4 w-4" /> Create Invoice
          </button>
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
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-[#8ccfff]/10 bg-[#0a2239]/65 hover:bg-[#0e2f4f]/80"
                >
                  <td className="px-4 py-3 font-semibold text-[#edf7ff]">{invoice.id}</td>
                  <td className="px-4 py-3 text-[#cce8ff]">{invoice.client}</td>
                  <td className="px-4 py-3 text-[#cce8ff]">{formatDate(invoice.date)}</td>
                  <td className="px-4 py-3 font-semibold text-[#edf7ff]">{formatMoney(invoice.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        invoice.status === "Paid"
                          ? "border border-[#86f0bb]/30 bg-[#1a5039]/55 text-[#a2f6cb]"
                          : invoice.status === "Overdue"
                            ? "border border-[#ff9d9d]/30 bg-[#4a1f2a]/60 text-[#ffc2c2]"
                            : "border border-[#ffd16d]/30 bg-[#4f3a13]/60 text-[#ffe2a3]"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-lg p-2 text-[#a7d7ff] transition hover:bg-[#12375b] hover:text-[#eef8ff]">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-[#a7d7ff] transition hover:bg-[#12375b] hover:text-[#eef8ff]">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-[#a7d7ff] transition hover:bg-[#12375b] hover:text-[#eef8ff]">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
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
          <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#8ccfff]/28 bg-[#0f2b48] px-3.5 py-2 text-xs font-semibold text-[#ddf3ff] transition hover:border-[#8ccfff]/48">
            <BellRing className="h-4 w-4" /> Send Payment Reminders
          </button>
        </article>

        <article className="surface rounded-2xl p-4">
          <h3 className="font-[var(--font-space)] text-lg font-semibold text-[#f4fbff]">Invoice Strategy</h3>
          <p className="mt-2 text-sm text-[#cae7ff]/78">Split large projects into milestone invoices to smooth your monthly income.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#8ccfff]/26 bg-[#0e2a46] px-3.5 py-2 text-xs text-[#d8efff]">
            <Wallet className="h-4 w-4 text-[#8fd8ff]" /> Best practice: 40/40/20 milestone structure
          </div>
        </article>
      </section>
    </div>
  );
}
