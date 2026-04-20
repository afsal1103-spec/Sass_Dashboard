"use client";

import { motion } from "framer-motion";
import { Github, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.firstName) localStorage.setItem("firstName", response.data.firstName);
        if (response.data.lastName) localStorage.setItem("lastName", response.data.lastName);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-[#ecf2ff]">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-45" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#4cc9f0]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#ffb703]/18 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface spotlight relative w-full max-w-md rounded-3xl p-7"
      >
        <div className="mb-7">
          <p className="inline-flex items-center gap-1 rounded-full border border-[#8ccfff]/25 bg-[#0f2f4e]/75 px-2.5 py-1 text-xs font-semibold text-[#a7dbff]">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure workspace
          </p>
          <h1 className="mt-3 font-[var(--font-space)] text-3xl font-semibold text-[#f5fbff]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#cae7ff]/76">Sign in to continue managing clients, projects, and invoices.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[#ff9d9d]/32 bg-[#4a202b]/60 p-3 text-xs text-[#ffc7c7]">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-[#9dccf1]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              required
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9dccf1]">Password</label>
              <Link href="#" className="text-xs font-medium text-[#8fd8ff] hover:text-[#b5e8ff]">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-[#8ccfff]/25 bg-[#0d243d]/80 px-3 py-2.5 text-sm text-[#eff8ff] outline-none transition focus:border-[#8ccfff]/55"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#ffd16d] py-2.5 text-sm font-semibold text-[#132a42] transition hover:bg-[#ffe09c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9dccf1]/72 before:h-px before:flex-1 before:bg-[#8ccfff]/20 after:h-px after:flex-1 after:bg-[#8ccfff]/20">
          or continue with
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#8ccfff]/26 bg-[#0e2c4a] py-2 text-sm font-medium text-[#ddf2ff] transition hover:border-[#8ccfff]/5">
            <Github className="h-4 w-4" /> GitHub
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#8ccfff]/26 bg-[#0e2c4a] py-2 text-sm font-medium text-[#ddf2ff] transition hover:border-[#8ccfff]/5">
            <Mail className="h-4 w-4" /> Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-[#cae7ff]/78">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#eff8ff] hover:text-[#bce9ff]">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
