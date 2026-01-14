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
          ?.scrollIntoView({ behavior: "smooth" });
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
    <div className="w-full max-w-4xl mx-auto p-4 box-border">
      {/* FORM */}
      <form onSubmit={handleSummarize} className="w-full">
        <textarea
          value={meetingText}
          onChange={(e) => {
            setMeetingText(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste meeting notes or transcript here..."
          rows={6}
          className="w-full bg-blue-200 rounded-2xl p-5 text-black dark:bg-green-200 resize-none"
        />

        <div className="flex flex-col sm:flex-row gap-5 py-8 w-full justify-center items-center">
          <button
            type="button"
            className="shrink-0 flex h-12 w-full sm:w-[180px] items-center justify-center gap-2 rounded-full 
            bg-foreground px-5 text-background border border-black/8 transition-colors hover:text-white 
            hover:bg-[#383838] dark:border-white/8 dark:hover:bg-[#ccc] dark:hover:text-black"
          >
            Record Meeting
          </button>

          <button
            type="submit"
            disabled={isDisabled}
            className={`h-12 rounded-full px-5 transition-colors w-full sm:w-44 ${
              isDisabled
                ? "bg-black cursor-not-allowed text-white dark:bg-white dark:text-black"
                : "bg-blue-300 hover:bg-black/80 text-black dark:bg-green-300 dark:hover:bg-white/80 hover:text-white dark:hover:text-black"
            }`}
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </div>
      </form>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-600">
          Processing your meeting...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-center mt-4">{error}</p>
      )}

      {/* RESULT */}
      {result && (
        <div
          id="summary-result"
          className="space-y-6 mt-10 text-black dark:text-white"
        >
          <h2 className="text-2xl font-bold mb-2 underline">{result.title}</h2>
          <div className="ml-5">
            <div>
              <h2 className="text-xl font-semibold mb-2">Meeting Summary</h2>
              <p className="max-w-prose leading-relaxed ml-2 mb-5">
                {result.summary}
              </p>
            </div>

            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Action Items</h2>
                {result.actionItems.length ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {result.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No action items identified.
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Schedule</h2>
                {result.schedule.length ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {result.schedule.map((item, i) => (
                      <li key={i}>
                        {item}{" "}
                        {item && item.trim() !== "" && !item.includes("TBD") ? (
                          <button
                            onClick={() =>
                              addToCalendar(
                                item,
                                result.title || "Meeting",
                                result.summary
                              )
                            }
                            className="text-sm ml-2 px-2 py-1 rounded-2xl bg-blue-300 hover:bg-black/80 text-black dark:bg-green-300 dark:hover:bg-white/80 hover:text-white dark:hover:text-black"
                              >
                                Add to Calendar
                              </button>
                            ) : (
                              <span className="text-sm text-gray-500 ml-2">(No date specified)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No scheduling information found.
                  </p>
                )}
              </div>
            </div>
        </div>
    </div>

      )}
      
    </div>
  );
};

export default Summarizer;
