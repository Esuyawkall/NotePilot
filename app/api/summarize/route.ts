import { NextResponse } from "next/server";
import OpenAI from "openai";

type ScheduleItem = string | { date: string; time: string };
type StringListItem = string | { date: string; time: string };

type ParsedResult = {
  title?: string;
  summary?: string;
  keyPoints?: StringListItem[];
  decisions?: StringListItem[];
  actionItems?: ScheduleItem[];
  nextSteps?: StringListItem[];
  risks?: StringListItem[];
  schedule?: ScheduleItem[];
};

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (typeof item === "string") {
      return item.trim();
    }

    if (item && typeof item === "object" && "date" in item && "time" in item) {
      return `${String((item as { date?: string }).date || "")} ${String((item as { time?: string }).time || "")}`.trim();
    }

    return "";
  }).filter(Boolean);
};

const normalizeSchedule = (value: unknown): string[] => {
  const items = ensureStringArray(value);
  if (items.length === 0) {
    return ["TBD"]; 
  }

  return items;
};

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const model = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { meetingText } = body as { meetingText?: string };

    if (!meetingText || !meetingText.trim()) {
      return NextResponse.json(
        { error: "Meeting text is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI summarization is not configured. Add GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const prompt = `
You are an AI meeting assistant. Analyze the meeting transcript and return valid JSON ONLY.

Return an object with exactly these keys:
{
  "title": "A short, descriptive title (3-7 words)",
  "summary": "A concise summary of the meeting",
  "keyPoints": ["brief highlight 1", "brief highlight 2"],
  "decisions": ["decision 1", "decision 2"],
  "actionItems": ["action item 1", "action item 2"],
  "nextSteps": ["next step 1", "next step 2"],
  "risks": ["risk or blocker 1", "risk or blocker 2"],
  "schedule": ["Date or time for action item 1", "Date or time for action item 2"]
}

Rules:
1. Return only valid JSON with no markdown fences or explanation.
2. Include arrays as lists of strings.
3. Use "TBD" when a date or time is not known.
4. Keep actionItems and schedule arrays aligned by index.
5. If some sections have no content, use empty arrays.
6. The summary should be 2-4 sentences.

Meeting transcript:
${meetingText}
`;

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty content");
    }

    let parsed: ParsedResult;
    try {
      parsed = JSON.parse(content) as ParsedResult;
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI response not valid JSON");
      }

      parsed = JSON.parse(jsonMatch[0]) as ParsedResult;
    }

    const safeActionItems = ensureStringArray(parsed.actionItems);
    const safeSchedule = normalizeSchedule(parsed.schedule);
    const safeScheduleLength = Math.max(safeActionItems.length, safeSchedule.length);

    const normalizedSchedule = Array.from({ length: safeScheduleLength }, (_, index) =>
      safeSchedule[index] || "TBD"
    );

    const title = parsed.title?.trim() ||
      `${meetingText.split(/\s+/).slice(0, 5).join(" ")}${meetingText.split(/\s+/).length > 5 ? "..." : ""}` ||
      "Meeting Summary";

    return NextResponse.json({
      title,
      summary: parsed.summary?.trim() || "No summary generated.",
      keyPoints: ensureStringArray(parsed.keyPoints),
      decisions: ensureStringArray(parsed.decisions),
      actionItems: safeActionItems.length
        ? safeActionItems
        : ["No action items identified."],
      nextSteps: ensureStringArray(parsed.nextSteps),
      risks: ensureStringArray(parsed.risks),
      schedule: normalizedSchedule,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}