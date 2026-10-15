"use client";
import { useEffect, useMemo, useState } from "react";

import { summarizeMeetingAPI, SummaryResult } from "@/lib/api";
import { generateICS } from "@/lib/ics";
import { parseScheduleText } from "@/lib/schedule";
import { createSavedMeeting, SavedMeeting } from "@/lib/meeting-history";

type SummarizerProps = {
  initialText?: string;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
  onSaveMeeting?: (meeting: SavedMeeting) => void;
};

const sampleTemplates = [
  {
    label: "Product sync",
    transcript:
      "The product team reviewed launch blockers for the onboarding flow. We agreed to simplify the checkout step by removing optional fields, assign Priya to test the mobile funnel, and share a final QA report by Thursday at 3 PM.",
  },
  {
    label: "Customer call",
    transcript:
      "The customer reported onboarding confusion and requested a clearer dashboard. We committed to a 30-minute training session next Tuesday, share a revised pricing summary, and document open risks around API latency before Friday.",
  },
  {
    label: "Leadership standup",
    transcript:
      "We reviewed the roadmap, aligned on the Q3 hiring plan, and decided to pause the lower-priority experiment until the new analytics dashboards are complete. Alex will draft the hiring brief and Maria will confirm vendor pricing later this week.",
  },
];

const Summarizer = ({
  initialText = "",
  isAuthenticated = false,
  onRequireAuth,
  onSaveMeeting,
}: SummarizerProps) => {
  const [meetingText, setMeetingText] = useState<string>(initialText);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(() => {
    const trimmed = meetingText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [meetingText]);

  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const isDisabled = loading || meetingText.trim() === "";

  useEffect(() => {
    setMeetingText(initialText);
  }, [initialText]);

  const handleSummarize = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!meetingText.trim()) {
      setError("Please enter meeting notes first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await summarizeMeetingAPI(meetingText);
      setResult(data);

      setTimeout(() => {
        document
          .getElementById("summary-result")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = (
    scheduleItem: string,
    title: string,
    summary: string
  ) => {
    if (!scheduleItem || scheduleItem.includes("TBD")) {
      return;
    }

    const date = parseScheduleText(scheduleItem);

    const ics = generateICS({
      title,
      description: summary,
      startDate: date,
    });

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.ics`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    if (!result) return;

    const summaryText = [
      `Title: ${result.title}`,
      "",
      `Summary: ${result.summary}`,
      "",
      "Key points:",
      ...(result.keyPoints?.length ? result.keyPoints.map((item) => `- ${item}`) : ["- None identified"]),
      "",
      "Action items:",
      ...(result.actionItems?.length ? result.actionItems.map((item) => `- ${item}`) : ["- None identified"]),
      "",
      "Next steps:",
      ...(result.nextSteps?.length ? result.nextSteps.map((item) => `- ${item}`) : ["- None identified"]),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy summary to clipboard.");
    }
  };

  const handleDownloadMarkdown = () => {
    if (!result) return;

    const content = [
      `# ${result.title}`,
      "",
      result.summary,
      "",
      "## Key points",
      ...(result.keyPoints?.length ? result.keyPoints.map((item) => `- ${item}`) : ["- None identified"]),
      "",
      "## Action items",
      ...(result.actionItems?.length ? result.actionItems.map((item) => `- ${item}`) : ["- None identified"]),
      "",
      "## Next steps",
      ...(result.nextSteps?.length ? result.nextSteps.map((item) => `- ${item}`) : ["- None identified"]),
      "",
      "## Schedule",
      ...(result.schedule?.length ? result.schedule.map((item) => `- ${item}`) : ["- TBD"]),
    ].join("\n");

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveMeeting = () => {
    if (!result) return;

    if (!isAuthenticated) {
      onRequireAuth?.();
      setError("Please sign up or log in to save this meeting.");
      return;
    }

    const meeting = createSavedMeeting(
      {
        title: result.title,
        summary: result.summary,
        keyPoints: result.keyPoints || [],
        decisions: result.decisions || [],
        actionItems: result.actionItems || [],
        nextSteps: result.nextSteps || [],
        risks: result.risks || [],
        schedule: result.schedule || [],
      },
      "notes"
    );

    onSaveMeeting?.(meeting);
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-4 box-border">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Live input</p>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-50">{wordCount}</span>
            <span className="text-sm text-slate-500 dark:text-zinc-400">words</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Reading time</p>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-50">{readingMinutes}</span>
            <span className="text-sm text-slate-500 dark:text-zinc-400">min</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">AI output</p>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-2xl font-semibold text-slate-900 dark:text-zinc-50">{result ? result.actionItems.length + result.schedule.length : 0}</span>
            <span className="text-sm text-slate-500 dark:text-zinc-400">items</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSummarize} className="w-full">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">Quick templates</p>
          <button
            type="button"
            onClick={() => setMeetingText("")}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-500 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Clear
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {sampleTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setMeetingText(template.transcript)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              {template.label}
            </button>
          ))}
        </div>

        <textarea
          value={meetingText}
          onChange={(e) => {
            setMeetingText(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste meeting notes or transcript here..."
          rows={7}
          className="w-full resize-none rounded-3xl border border-slate-200 bg-slate-100/80 p-5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/10"
        />

        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-slate-500 dark:text-zinc-400">
            Supported sources: notes, transcripts, and uploaded audio
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              className="flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Record Meeting
            </button>

            <button
              type="submit"
              disabled={isDisabled}
              className={`h-12 rounded-full px-5 text-sm font-semibold transition-all sm:min-w-[180px] ${
                isDisabled
                  ? "cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              }`}
            >
              {loading ? "Summarizing..." : "Summarize"}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          Processing your meeting...
        </p>
      )}

      {error && (
        <p className="mt-4 text-center text-sm font-medium text-red-500">{error}</p>
      )}

      {result && (
        <div
          id="summary-result"
          className="mt-10 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/80 dark:border-zinc-800 dark:bg-zinc-950/70 dark:ring-zinc-800"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold underline decoration-slate-300 dark:decoration-zinc-700">
              {result.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveMeeting}
                disabled={!isAuthenticated}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                  isAuthenticated
                    ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
                }`}
              >
                {isAuthenticated ? "Save meeting" : "Sign in to save"}
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                {copied ? "Copied" : "Copy summary"}
              </button>
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Download .md
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Decisions</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-zinc-50">{result.decisions?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Action items</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-zinc-50">{result.actionItems?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-zinc-900/80">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">Schedule</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-zinc-50">{result.schedule?.length ?? 0}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <section>
                <h3 className="mb-2 text-xl font-semibold">Meeting Summary</h3>
                <p className="max-w-prose leading-relaxed text-slate-700 dark:text-slate-200">
                  {result.summary}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-xl font-semibold">Key points</h3>
                {result.keyPoints?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {result.keyPoints.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No key points detected.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xl font-semibold">Next steps</h3>
                {result.nextSteps?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {result.nextSteps.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No next steps identified.</p>
                )}
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="mb-2 text-xl font-semibold">Decisions</h3>
                {result.decisions?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {result.decisions.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No decisions captured.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xl font-semibold">Action items</h3>
                {result.actionItems?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {result.actionItems.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No action items identified.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xl font-semibold">Schedule</h3>
                {result.schedule?.length ? (
                  <ul className="space-y-2 text-slate-700 dark:text-slate-200">
                    {result.schedule.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/80">
                        <span>{item}</span>
                        {item && !item.includes("TBD") && (
                          <button
                            type="button"
                            onClick={() => addToCalendar(item, result.title || "Meeting", result.summary)}
                            className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700 transition hover:bg-blue-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                          >
                            Add
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No scheduling information found.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xl font-semibold">Risks & blockers</h3>
                {result.risks?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {result.risks.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No blockers reported.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
