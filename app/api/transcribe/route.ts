import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const apiKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Audio transcription is not configured. Add HF_TOKEN or HUGGINGFACE_API_KEY." },
        { status: 500 }
      );
    }

    const audioBuffer = await file.arrayBuffer();

    const hfRes = await fetch(
      "https://router.huggingface.co/models/openai/whisper-tiny",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/octet-stream",
          Accept: "application/json",
        },
        body: audioBuffer,
      }
    );

    const text = await hfRes.text();

    if (!hfRes.ok) {
      console.error("HF error:", text);
      return NextResponse.json(
        { error: "Hugging Face transcription failed", details: text },
        { status: 500 }
      );
    }

    const data = JSON.parse(text);

    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
