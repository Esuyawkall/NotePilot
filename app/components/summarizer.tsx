"use client";
import { useEffect, useState } from "react";

import { summarizeMeetingAPI, SummaryResult } from "@/lib/api";
import { generateICS } from "@/lib/ics";
import { parseScheduleText } from "@/lib/schedule";

type SummarizerProps = {
  initialText?: string;
};

const Summarizer = ({ initialText = "" }: SummarizerProps) => {
  const [meetingText, setMeetingText] = useState<string>(initialText);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  function addToCalendar(
    scheduleItem: string,
    title: string,
    summary: string
  ) {
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
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 box-border">
      <form onSubmit={handleSummarize} className="w-full">
        <textarea
          value={meetingText}
          onChange={(e) => {
            setMeetingText(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste meeting notes or transcript here..."
          rows={6}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-100/80 p-5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/10"
        />

        <div className="flex w-full flex-col items-center justify-center gap-5 py-8 sm:flex-row">
          <button
            type="button"
            className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 sm:w-[180px]"
          >
            Record Meeting
          </button>

          <button
            type="submit"
            disabled={isDisabled}
            className={`h-12 w-full rounded-full px-5 text-sm font-semibold transition-all sm:w-44 ${
              isDisabled
                ? "cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400"
                : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
            }`}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>
      </form>

      {loading && (
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
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
          <h2 className="mb-2 text-2xl font-bold underline decoration-slate-300 dark:decoration-zinc-700">
            {result.title}
          </h2>

          <div className="mt-6 space-y-8">
            <section>
              <h3 className="mb-2 text-xl font-semibold">Meeting Summary</h3>
              <p className="ml-2 max-w-prose leading-relaxed text-slate-700 dark:text-slate-200">
                {result.summary}
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="mb-2 text-xl font-semibold">Action Items</h3>
                {result.actionItems.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200">
                    {result.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No action items identified.
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xl font-semibold">Schedule</h3>
                {result.schedule.length ? (
                  <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-200">
                    {result.schedule.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        <span>{item}</span>
                        {item && item.trim() !== "" && !item.includes("TBD") ? (
                          <button
                            type="button"
                            onClick={() =>
                              addToCalendar(
                                item,
                                result.title || "Meeting",
                                result.summary
                              )
                            }
                            className="ml-2 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                          >
                            Add to Calendar
                          </button>
                        ) : (
                          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                            (No date specified)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No scheduling information found.
                  </p>
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
