"use client";

export type SummaryResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  nextSteps: string[];
  risks: string[];
  schedule: string[];
};

export const summarizeMeetingAPI = async (
  text: string
): Promise<SummaryResult> => {
  if (!text.trim()) {
    throw new Error("Meeting text is required");
  }

  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ meetingText: text }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error || "Failed to summarize meeting");
  }

  const data: SummaryResult = await response.json();

  return {
    title: data.title || "Meeting Summary",
    summary: data.summary || "No summary generated.",
    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
    decisions: Array.isArray(data.decisions) ? data.decisions : [],
    actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    risks: Array.isArray(data.risks) ? data.risks : [],
    schedule: Array.isArray(data.schedule) ? data.schedule : [],
  };
};
