"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const authFields = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to view your saved meetings, decisions, and follow-up plans.",
    primary: "Log in",
  },
  signup: {
    title: "Create your account",
    subtitle: "Save your meeting notes, tasks, and summaries in one organized workspace.",
    primary: "Create account",
  },
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const current = authFields[mode];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("notepilot-auth", "true");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-zinc-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            ← Back home
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            NotePilot
          </div>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
              AI meeting intelligence
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              {current.title}
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-slate-600 dark:text-zinc-300">
              {current.subtitle}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Save meeting summaries",
                "Track important decisions",
                "Keep follow-ups organized",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/80 dark:border-zinc-800 dark:bg-zinc-950/70 dark:ring-zinc-800">
            <div className="inline-flex w-full rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-200">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/10"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-200">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-200">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/10"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-zinc-200">
                    Workspace name
                  </label>
                  <input
                    type="text"
                    placeholder="Optional workspace name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/10"
                  />
                </div>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                {current.primary}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
              {mode === "login" ? (
                <>
                  Need an account? <button type="button" onClick={() => setMode("signup")} className="font-medium text-blue-600 dark:text-emerald-400">Sign up</button>
                </>
              ) : (
                <>
                  Already have an account? <button type="button" onClick={() => setMode("login")} className="font-medium text-blue-600 dark:text-emerald-400">Log in</button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
