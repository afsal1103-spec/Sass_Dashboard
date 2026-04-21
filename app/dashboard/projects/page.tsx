"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Briefcase, 
  Calendar, 
  User, 
  Trash2, 
  Edit2, 
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Filter,
  ChevronRight,
  Target,
  Layout
} from "lucide-react";
import axios from "@/lib/axios";
import toast from "react-hot-toast";

interface Client {
  id: number;
  name: string;
  company: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  client: Client;
}

const statusConfig = {
  "PLANNED": { 
    label: "Planned", 
    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500", 
    dot: "bg-yellow-500",
    progress: "0%"
  },
  "IN_PROGRESS": { 
    label: "In Progress", 
    color: "bg-blue-500/10 border-blue-500/20 text-blue-400", 
    dot: "bg-blue-400",
    progress: "45%"
  },
  "COMPLETED": { 
    label: "Completed", 
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", 
    dot: "bg-emerald-400",
    progress: "100%"
  },
  "ON_HOLD": { 
    label: "On Hold", 
    color: "bg-orange-500/10 border-orange-500/20 text-orange-500", 
    dot: "bg-orange-500",
    progress: "0%"
  },
  "CANCELLED": { 
    label: "Cancelled", 
    color: "bg-red-500/10 border-red-500/20 text-red-500", 
    dot: "bg-red-500",
    progress: "0%"
  },
};

type ProjectStatus = keyof typeof statusConfig;

const normalizeProjectStatus = (status?: string): ProjectStatus => {
  if (!status) return "PLANNED";
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  return (Object.keys(statusConfig) as ProjectStatus[]).includes(normalized as ProjectStatus)
    ? (normalized as ProjectStatus)
    : "PLANNED";
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState<keyof typeof statusConfig>("PLANNED");
  const [deadline, setDeadline] = useState("");
  const spring = { type: "spring", stiffness: 320, damping: 24 };

  const fetchData = async () => {
    try {
      // Only show loading spinner on initial load to prevent flicker on navigation
      if (projects.length === 0) setIsLoading(true);
      console.log("Fetching projects and clients...");
      
      const [projectsRes, clientsRes] = await Promise.all([
        axios.get("/projects").catch(e => { console.error("Projects fetch error:", e); return { data: [] }; }),
        axios.get("/clients").catch(e => { console.error("Clients fetch error:", e); return { data: [] }; })
      ]);

      console.log("Data received - Projects:", projectsRes.data.length, "Clients:", clientsRes.data.length);
      
      setProjects(projectsRes.data || []);
      setClients(clientsRes.data || []);
      setIsSessionExpired(false);
    } catch (error: any) {
      console.error("General fetch error:", error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setIsSessionExpired(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setClientId("");
    setStatus("PLANNED");
    setDeadline("");
    setEditingProject(null);
  };

  const handleAddProject = () => {
    if (isModalOpen) return;
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    console.log("Editing Project:", project);
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setClientId(project.client?.id?.toString() || "");
    setStatus(normalizeProjectStatus(project.status));
    setDeadline(project.deadline);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Please select a client first");
      return;
    }
    const loadingToast = toast.loading(editingProject ? "Updating project..." : "Creating project...");
    try {
      const projectData = {
        title,
        description,
        status: normalizeProjectStatus(status),
        deadline: deadline || null,
        client: { id: parseInt(clientId) }
      };

      console.log("Sending project data:", projectData);

      if (editingProject) {
        await axios.put(`/projects/${editingProject.id}`, projectData);
        toast.success("Project updated successfully", { id: loadingToast });
      } else {
        const response = await axios.post("/projects", projectData);
        console.log("Project creation response:", response.data);
        toast.success("Project created", { id: loadingToast });
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Project submission error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data || "Failed to save project", { id: loadingToast });
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const loadingToast = toast.loading("Deleting project...");
      try {
        await axios.delete(`/projects/${id}`);
        toast.success("Project deleted successfully", { id: loadingToast });
        fetchData();
      } catch (error: any) {
        toast.error("Failed to delete project", { id: loadingToast });
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                         (project.client?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || normalizeProjectStatus(project.status) === statusFilter;
    const matchesClient = clientFilter === "all" || project.client?.id?.toString() === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
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
              placeholder="Search projects or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2 text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-white/10 appearance-none pr-8"
          >
            <option value="all" className="bg-[#1A1A1A]">All Status</option>
            {Object.keys(statusConfig).map((key) => (
              <option key={key} value={key} className="bg-[#1A1A1A]">{statusConfig[key as keyof typeof statusConfig].label}</option>
            ))}
          </select>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#1A1A1A] px-3 py-2 text-sm text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-white/10 appearance-none pr-8"
          >
            <option value="all" className="bg-[#1A1A1A]">All Clients</option>
            {clients && clients.length > 0 && clients.map((c) => (
              <option key={c.id} value={c.id.toString()} className="bg-[#1A1A1A]">{c.name}</option>
            ))}
          </select>
        </div>
        <motion.button
          onClick={() => {
            console.log("Inline onClick: New Project button clicked");
            handleAddProject();
          }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <Plus className="h-4 w-4" /> New Project
        </motion.button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-sm text-white/40 font-medium">Loading projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const projectStatus = normalizeProjectStatus(project.status);
              return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                transition={spring}
                key={project.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    key={projectStatus}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${statusConfig[projectStatus].color} flex items-center gap-1.5`}
                  >
                    <div className={`h-1 w-1 rounded-full ${statusConfig[projectStatus].dot}`} />
                    {statusConfig[projectStatus].label}
                  </motion.div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditProject(project)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Edit Project"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors" title="Delete Project"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">{project.title}</h3>
                <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                  <User className="h-3 w-3" />
                  <span>{project.client?.name || "Unknown Client"}</span>
                </div>

                <p className="text-sm text-white/60 line-clamp-2 mb-6 flex-1">{project.description}</p>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-white/40">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar (Fake % for Day 5) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                      <span>Progress</span>
                      <span>{statusConfig[projectStatus].progress}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: statusConfig[projectStatus].progress }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${projectStatus === "COMPLETED" ? "bg-emerald-500" : projectStatus === "IN_PROGRESS" ? "bg-blue-400" : "bg-yellow-500"}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="h-16 w-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
            <Briefcase className="h-8 w-8 text-white/20" />
          </div>
          <h3 className="text-xl font-bold mb-2">No projects yet</h3>
          <p className="text-sm text-white/40 max-w-[280px] leading-relaxed mb-8">
            {searchTerm || statusFilter !== "all" || clientFilter !== "all"
              ? "No projects match your current filters." 
              : "Launch your first project and start tracking your workflow today."}
          </p>
          <div className="flex gap-3">
            <motion.button 
              onClick={() => fetchData()} 
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              <Search className="h-4 w-4" /> Reload Data
            </motion.button>
            <motion.button 
              onClick={handleAddProject} 
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-white/90 transition-all shadow-lg shadow-white/5"
            >
              <Plus className="h-4 w-4" /> Start New Project
            </motion.button>
          </div>
        </div>
      )}

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
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl"
            >
            <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{editingProject ? "Edit Project" : "New Project"}</h2>
                <p className="text-sm text-white/40 font-medium">Define your project scope and client</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-white/20 hover:bg-white/5 hover:text-white transition-all"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Project Title</label>
                    <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E-commerce Redesign" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-white" />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Client</label>
                    <div className="relative">
                      <select 
                        required 
                        value={clientId} 
                        onChange={(e) => setClientId(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none text-white"
                      >
                        <option value="" className="bg-[#1A1A1A]">Select a client</option>
                        {clients && clients.length > 0 ? (
                          clients.map(c => (
                            <option key={c.id} value={c.id.toString()} className="bg-[#1A1A1A]">
                              {c.name} {c.company ? `(${c.company})` : ""}
                            </option>
                          ))
                        ) : (
                          <option disabled className="bg-[#1A1A1A]">No clients found. Add one in Clients page.</option>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Deadline</label>
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 text-white [color-scheme:dark]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Status</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as keyof typeof statusConfig)}
                        className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none text-white"
                      >
                        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => (
                          <option key={key} value={key} className="bg-[#1A1A1A]">
                            {statusConfig[key].label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 ml-1">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project goals and key deliverables..." rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-all focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none text-white" />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold transition-all hover:bg-white/10 active:scale-95 text-white">Cancel</button>
                <button
                  type="submit"
                  disabled={clients.length === 0}
                  className="flex-1 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-white/90 shadow-xl shadow-white/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingProject ? "Save Updates" : "Create Project"}
                </button>
              </div>
              {clients.length === 0 && (
                <p className="mt-3 text-xs text-amber-300/90">
                  No clients available yet. Add a client first, then create your project.
                </p>
              )}
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Session Expired Overlay */}
      <AnimatePresence>
        {isSessionExpired && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] p-10 text-center shadow-2xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Session Expired</h2>
              <p className="mb-8 text-sm leading-relaxed text-white/40">Please sign in again to continue managing your projects.</p>
              <button onClick={() => window.location.href = "/login"} className="w-full rounded-xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-95">Sign In to Resume</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
