"use client"; // if using App Router

export type SummaryResult = {
  title: string;
  summary: string;
  actionItems: string[];
  schedule: string[];
};

export const summarizeMeetingAPI = async (
  text: string
): Promise<SummaryResult> => {
  if (!text.trim()) {
    throw new Error("Meeting text is required");
  }

  const response = await fetch("/api/summarize", {  // <-- relative path
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
  return data;
};
