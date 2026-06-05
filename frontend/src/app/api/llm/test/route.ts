import { NextResponse } from "next/server";
import { getConfig } from "@/lib/configStore";

export async function GET() {
  const config = getConfig();
  const apiKey = config.groqApiKey || process.env.GROQ_API_KEY || "";

  if (!apiKey) {
    return NextResponse.json({ valid: false, error: "No API key configured" });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      return NextResponse.json({ valid: true, error: null });
    }

    const err = await res.text();
    return NextResponse.json({ valid: false, error: err });
  } catch {
    return NextResponse.json({ valid: false, error: "Cannot reach Groq API" });
  }
}
