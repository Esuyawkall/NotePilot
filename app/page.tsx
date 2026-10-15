"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Summarizer from "./components/summarizer";
import Upload from "./components/upload";
import { loadSavedMeetings, saveSavedMeetings, SavedMeeting } from "@/lib/meeting-history";

export default function Page() {
  const [meetingText, setMeetingText] = useState("");
  const [fileType, setFileType] = useState<"text" | "audio" | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [savedMeetings, setSavedMeetings] = useState<SavedMeeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = window.localStorage.getItem("darkMode");
      const nextDark =
        savedTheme === null
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
          : savedTheme === "true";

      setIsDark(nextDark);
      document.documentElement.classList.toggle("dark", nextDark);
      document.documentElement.style.colorScheme = nextDark ? "dark" : "light";
    };

    const authState = window.localStorage.getItem("notepilot-auth") === "true";
    setIsAuthenticated(authState);

    const meetings = loadSavedMeetings();
    setSavedMeetings(meetings);
    if (meetings[0]) {
      setSelectedMeetingId(meetings[0].id);
    }

    updateTheme();
    window.addEventListener("storage", updateTheme);
    window.addEventListener("themechange", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themechange", updateTheme);
    };
  }, []);

  useEffect(() => {
    saveSavedMeetings(savedMeetings);
  }, [savedMeetings]);

  const selectedMeeting = useMemo(
    () => savedMeetings.find((meeting) => meeting.id === selectedMeetingId) ?? savedMeetings[0] ?? null,
    [savedMeetings, selectedMeetingId]
  );

  const upcomingTasks = useMemo(
    () => savedMeetings.reduce((total, meeting) => total + meeting.actionItems.length, 0),
    [savedMeetings]
  );

  const toggleDarkMode = () => {
    const nextValue = !isDark;
    window.localStorage.setItem("darkMode", String(nextValue));
    setIsDark(nextValue);
    document.documentElement.classList.toggle("dark", nextValue);
    document.documentElement.style.colorScheme = nextValue ? "dark" : "light";
    window.dispatchEvent(new Event("themechange"));
  };

  const openUpload = (type: "text" | "audio") => {
    setFileType(type);
    setIsOpen(true);
  };

  const closeUpload = () => {
    setIsOpen(false);
    setFileType(null);
  };

  const handleSaveMeeting = (meeting: SavedMeeting) => {
    if (!isAuthenticated) {
      window.location.assign("/auth");
      return;
    }

    setSavedMeetings((current) => {
      const next = [meeting, ...current.filter((item) => item.id !== meeting.id)].slice(0, 12);
      setSelectedMeetingId(meeting.id);
      return next;
    });
  };

  const requireAuth = () => {
    window.location.assign("/auth");
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-4 pb-10 pt-28 sm:px-6 lg:px-8">
        <menu className="fixed inset-x-0 top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => openUpload("audio")}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Upload audio
              </button>
              <button type="button" onClick={() => openUpload("text")} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800">
                Upload text file
              </button>
              <button type="button" onClick={() => document.getElementById("meeting-summarizer")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800">
                Create summary
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                {isAuthenticated ? "Account" : "Log in"}
              </Link>
            </div>
          </div>
        </menu>

        <div className="mt-20 flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            AI meeting intelligence
          </div>
          <h1 className="max-w-xxl text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-50 sm:text-4xl">
            NotePilot
          </h1>
          <h2 className="max-w-xxl text-2xl leading-tight tracking-tight text-slate-900 dark:text-zinc-50 sm:text-2xl">
            Meeting Summarizer and Scheduler
          </h2>
          <p className="max-w-lg text-lg leading-8 text-slate-600 dark:text-zinc-400">
            Automatically summarize meetings, extract action items, capture decisions, and create a clear follow-up plan.
          </p>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-5xl gap-4 md:grid-cols-4">
          {[
            { title: "AI recap", text: "Transform notes into clear summaries and takeaways." },
            { title: "Task capture", text: "Turn spoken commitments into clear next steps." },
            { title: "Smart scheduling", text: "Plan your follow-ups without losing momentum." },
            { title: "Decision log", text: "Keep the meeting decisions and blockers visible." },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50">{feature.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{feature.text}</p>
            </div>
          ))}
        </div>

        {!isAuthenticated ? (
          <div className="mx-auto mt-8 w-full max-w-5xl rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-950/70">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Workspace access</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-zinc-50">Sign up or log in to continue</h3>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-zinc-300">
              Save meeting summaries, review recent follow-ups, and keep your notes organized in your personal workspace.
            </p>
            <Link
              href="/auth"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
            >
              Go to sign up / log in
            </Link>
          </div>
        ) : (
          <div className="mx-auto mt-8 grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-zinc-50">Recent meetings</h3>
                <span className="text-sm text-slate-500 dark:text-zinc-400">{savedMeetings.length} saved</span>
              </div>

              <div className="space-y-3">
                {savedMeetings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
                    No saved meetings yet. Summarize a meeting and save it when you are ready.
                  </div>
                ) : (
                  savedMeetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      type="button"
                      onClick={() => setSelectedMeetingId(meeting.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selectedMeeting?.id === meeting.id
                          ? "border-blue-200 bg-blue-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-zinc-50">{meeting.title}</p>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">{meeting.source}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-zinc-300">{meeting.summary}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                        {new Date(meeting.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
              {selectedMeeting ? (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Selected meeting</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-zinc-50">{selectedMeeting.title}</h3>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                      Saved summary
                    </span>
                  </div>

                  <p className="mt-5 leading-relaxed text-slate-700 dark:text-slate-200">{selectedMeeting.summary}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/80">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Key points</p>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
                        {selectedMeeting.keyPoints.length ? selectedMeeting.keyPoints.map((item, index) => <li key={`${item}-${index}`}>{item}</li>) : <li>No key points tracked.</li>}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/80">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Decisions</p>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
                        {selectedMeeting.decisions.length ? selectedMeeting.decisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>) : <li>No decisions recorded.</li>}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
                  No meeting selected yet.
                </div>
              )}
            </div>
          </div>
        )}

        <div id="meeting-summarizer">
          <Summarizer
            initialText={meetingText}
            isAuthenticated={isAuthenticated}
            onRequireAuth={requireAuth}
            onSaveMeeting={handleSaveMeeting}
          />
        </div>

        <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/auth" className="flex h-12 items-center justify-center rounded-full border border-slate-200 bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-700 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 md:w-[158px]">
              {isAuthenticated ? "Account" : "Sign in"}
            </Link>
            <button type="button" aria-label="Toggle dark mode" onClick={toggleDarkMode} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600">
              <Image src={isDark ? "/settings_white.svg" : "/settings.svg"} alt="settings icon" width={28} height={28} priority />
            </button>
          </div>
        </footer>
      </main>

      {isOpen && fileType && (
        <Upload
          fileType={fileType}
          onClose={closeUpload}
          onFileRead={async (fileOrText) => {
            if (fileType === "text") {
              setMeetingText(fileOrText as string);
            } else if (fileType === "audio") {
              const file = fileOrText as File;

              try {
                setMeetingText("Transcribing audio, please wait...");

                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/transcribe", {
                  method: "POST",
                  body: formData,
                });

                const resText = await res.text();

                if (!res.ok) {
                  console.error("API error:", resText);
                  throw new Error("Transcription failed");
                }

                const data = JSON.parse(resText);

                if (data.text) {
                  setMeetingText(data.text);
                } else {
                  setMeetingText("");
                }
              } catch (err) {
                console.error("Transcription failed:", err);
                setMeetingText("");
              }
            }

            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
