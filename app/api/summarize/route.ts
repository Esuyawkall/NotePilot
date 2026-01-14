import { NextResponse } from "next/server";
import OpenAI from "openai";

type ScheduleItem = string | { date: string; time: string };

type ParsedResult = {
  title: string;
  summary: string;
  actionItems: ScheduleItem[];
  schedule: ScheduleItem[];
};

// Initialize the Groq/OpenAI client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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

    const prompt = `
You are an AI meeting assistant. Your task is to analyze meeting notes and extract key information.

Analyze this meeting text and provide a JSON response with exactly this structure:

{
  "title": "A short, descriptive title for the meeting",
  "summary": "A concise summary of what was discussed",
  "actionItems": ["Action item 1", "Action item 2", "Action item 3"],
  "schedule": ["Date/time for action item 1", "Date/time for action item 2", "Date/time for action item 3"]
}

CRITICAL INSTRUCTIONS:
1. YOU MUST include ALL four fields: title, summary, actionItems, and schedule
2. Create a descriptive title that captures the main topic (3-7 words)
3. Summarize the key points concisely
4. Extract action items that the user needs to complete
5. For each action item, provide a date/time (use TBD if unknown)
6. actionItems and schedule arrays MUST have the same length
7. Return ONLY valid JSON, no other text

Meeting text to analyze:
${meetingText}
`;

    console.log("Sending prompt to AI...");
    console.log("Meeting text length:", meetingText.length);

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }, // Force JSON response
    });

    const content = completion.choices[0]?.message?.content;

    console.log("Raw AI response:", content);

    if (!content) {
      console.error("AI returned empty content");
      throw new Error("AI returned empty content");
    }

    // Safely parse the AI response
    let parsed: ParsedResult;
    try {
      parsed = JSON.parse(content) as ParsedResult;
    } catch (err) {
      console.error("Failed to parse AI response as JSON. Content:", content);
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]) as ParsedResult;
        } catch (innerErr) {
          throw new Error("AI response not valid JSON");
        }
      } else {
        throw new Error("AI response not valid JSON");
      }
    }

    // Log what we received
    console.log("Parsed result:", {
      title: parsed.title,
      summaryLength: parsed.summary?.length,
      actionItemsCount: parsed.actionItems?.length,
      scheduleCount: parsed.schedule?.length,
    });

    // Ensure actionItems and schedule are strings and have default values
    const safeActionItems = Array.isArray(parsed.actionItems)
      ? parsed.actionItems.map((item: ScheduleItem) =>
          typeof item === "string" ? item : `${item.date} at ${item.time}`
        )
      : [];

    const safeSchedule = Array.isArray(parsed.schedule)
      ? parsed.schedule.map((item: ScheduleItem) =>
          typeof item === "string" ? item : `${item.date} at ${item.time}`
        )
      : [];

    // Ensure we always have a title
    const title = parsed.title?.trim() || 
                  meetingText.split(/\s+/).slice(0, 5).join(' ') + "..." ||
                  "Meeting Summary";

    console.log("Final response being sent:", {
      title,
      summaryLength: parsed.summary?.length,
      actionItems: safeActionItems.length,
      schedule: safeSchedule.length,
    });

    return NextResponse.json({
      title: title,
      summary: parsed.summary || "No summary generated.",
      actionItems: safeActionItems,
      schedule: safeSchedule,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}