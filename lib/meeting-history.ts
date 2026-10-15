export type SavedMeeting = {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  nextSteps: string[];
  risks: string[];
  schedule: string[];
  createdAt: string;
  workspace: string;
  source: "notes" | "audio" | "transcript";
};

export type SummaryResultWithMeta = {
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  nextSteps: string[];
  risks: string[];
  schedule: string[];
};

const storageKey = "notepilot-meeting-history-v1";

export const createSavedMeeting = (
  result: SummaryResultWithMeta,
  source: SavedMeeting["source"] = "notes"
): SavedMeeting => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: result.title || "Untitled meeting",
  summary: result.summary || "No summary added.",
  keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
  decisions: Array.isArray(result.decisions) ? result.decisions : [],
  actionItems: Array.isArray(result.actionItems) ? result.actionItems : [],
  nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps : [],
  risks: Array.isArray(result.risks) ? result.risks : [],
  schedule: Array.isArray(result.schedule) ? result.schedule : [],
  createdAt: new Date().toISOString(),
  workspace: "Personal workspace",
  source,
});

export const loadSavedMeetings = (): SavedMeeting[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSavedMeetings = (meetings: SavedMeeting[]) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(storageKey, JSON.stringify(meetings));
};
