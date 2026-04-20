"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Mail, 
  Building2, 
  User, 
  Trash2, 
  Edit2, 
  X,
  Phone,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Target,
  Layout
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

interface Client {
  id: number;
  name: string;
  email: string;
  company: string;
  address?: string;
  phone?: string;
  status: string;
  notes?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/clients");
      setClients(res.data);
      setIsSessionExpired(false);
    } catch (error: any) {
      console.error("Failed to fetch clients:", error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setIsSessionExpired(true);
      } else {
        toast.error(error.response?.data || "Failed to load clients");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompany("");
    setPhone("");
    setAddress("");
    setStatus("active");
    setNotes("");
    setEditingClient(null);
  };

  const handleAddClient = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setCompany(client.company);
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setStatus(client.status);
    setNotes(client.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingClient ? "Updating client..." : "Adding client...");
    try {
      const clientData = { name, email, company, phone, address, status, notes };
      if (editingClient) {
        await axios.put(`/clients/${editingClient.id}`, clientData);
        toast.success("Client updated successfully", { id: loadingToast });
      } else {
        await axios.post("/clients", clientData);
        toast.success("Client added successfully", { id: loadingToast });
      }
      setIsModalOpen(false);
      resetForm();
      fetchClients();
    } catch (error: any) {
      console.error("Failed to save client:", error);
      toast.error(error.response?.data || "Failed to save client", { id: loadingToast });
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      const loadingToast = toast.loading("Deleting client...");
      try {
        await axios.delete(`/clients/${id}`);
        toast.success("Client deleted successfully", { id: loadingToast });
        fetchClients();
      } catch (error: any) {
        console.error("Failed to delete client:", error);
        toast.error(error.response?.data || "Failed to delete client", { id: loadingToast });
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search clients by name, email or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2 text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none pr-8 transition-all hover:bg-white/10"
          >
            <option value="all" className="bg-[#1A1A1A]">All Status</option>
            <option value="active" className="bg-[#1A1A1A]">Active</option>
            <option value="inactive" className="bg-[#1A1A1A]">Inactive</option>
            <option value="lead" className="bg-[#1A1A1A]">Lead</option>
          </select>
        </div>
        <button
          onClick={handleAddClient}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {/* Clients List */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm text-white/40 font-medium">Loading your clients...</p>
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Client</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Company</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((client) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={client.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 text-sm font-bold shadow-inner">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white/90">{client.name}</span>
                          <span className="text-xs text-white/40">{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-white/70">{client.company}</span>
                        {client.phone && <span className="text-xs text-white/40">{client.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        client.status === "active" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : client.status === "lead"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-white/5 border-white/10 text-white/40"
                      }`}>
                        <div className={`h-1 w-1 rounded-full ${
                          client.status === "active" ? "bg-emerald-400" : client.status === "lead" ? "bg-amber-400" : "bg-white/40"
                        }`} />
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClient(client)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95"
                          title="Edit Client"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all active:scale-95"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="h-16 w-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
              <Users className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Build your client network</h3>
            <p className="text-sm text-white/40 max-w-[280px] leading-relaxed">
              {searchTerm || statusFilter !== "all" 
                ? "No clients match your current filters. Try resetting them." 
                : "Manage all your clients, leads, and contacts in one place. Add your first client to get started."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button 
                onClick={() => {setSearchTerm(""); setStatusFilter("all");}}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Session Expired Overlay */}
      <AnimatePresence>
        {isSessionExpired && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] p-10 text-center shadow-2xl"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Session Expired</h2>
              <p className="mb-8 text-sm leading-relaxed text-white/40">
                Your security token has expired. Please sign in again to continue managing your clients.
              </p>
              <button
                onClick={() => window.location.href = "/login"}
                className="w-full rounded-xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-95"
              >
                Sign In to Resume
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
            >
              <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{editingClient ? "Edit Client" : "New Client"}</h2>
                  <p className="text-sm text-white/40 font-medium">Capture essential client information</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-white/20 hover:bg-white/5 hover:text-white transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Company</label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                        <input
                          required
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Lifecycle Status</label>
                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none text-white"
                        >
                          <option value="active" className="bg-[#1A1A1A]">Active</option>
                          <option value="inactive" className="bg-[#1A1A1A]">Inactive</option>
                          <option value="lead" className="bg-[#1A1A1A]">Lead</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Internal notes about the client relationship..."
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold transition-all hover:bg-white/10 active:scale-95 text-white"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-white/90 shadow-xl shadow-white/5 active:scale-95"
                  >
                    {editingClient ? "Save Updates" : "Add Client"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
