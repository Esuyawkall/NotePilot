"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Summarizer from "./components/summarizer";
import Upload from "./components/upload";

export default function Page() {
  const [meetingText, setMeetingText] = useState("");
  const [fileType, setFileType] = useState<"text" | "audio" | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

    updateTheme();
    window.addEventListener("storage", updateTheme);
    window.addEventListener("themechange", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themechange", updateTheme);
    };
  }, []);

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

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#09090b] dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-4 pb-10 pt-28 sm:px-6 lg:px-8">
        <menu className="fixed inset-x-0 top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800">
                Home
              </button>
              <button type="button" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800">
                Record Meeting
              </button>
              <button type="button" onClick={() => openUpload("text")} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800">
                Upload Text File
              </button>
              <button type="button" onClick={() => openUpload("audio")} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800">
                Upload Audio File
              </button>
            </div>

            <button type="button" aria-label="Open profile" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600">
              <Image id="profile" src={isDark ? "/profile_white.svg" : "/profile.svg"} alt="profile logo" width={32} height={32} priority />
            </button>
          </div>
        </menu>

        <div className="flex flex-col items-center gap-6 text-center mt-20">
          <h1 className="max-w-xxl text-3xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-50 sm:text-4xl">
            NotePilot </h1>
          <h1 className="max-w-xxl text-2xl leading-tight tracking-tight text-slate-900 dark:text-zinc-50 sm:text-2xl">

          Meeting Summarizer and Scheduler
          </h1>
          <p className="max-w-lg text-lg leading-8 text-slate-600 dark:text-zinc-400">
            Automatically summarize meetings, extract tasks, and schedule your next steps with AI.
          </p>
        </div>

        <Summarizer initialText={meetingText} />

        <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <a href="https://github.com/esuyawkall" className="flex h-12 items-center justify-center rounded-full border border-slate-200 bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-700 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 md:w-[158px]">
              Contact
            </a>
            <button type="button" aria-label="Toggle dark mode" onClick={toggleDarkMode} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600">
              <Image id="settings" src={isDark ? "/settings_white.svg" : "/settings.svg"} alt="settings icon" width={28} height={28} priority />
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
