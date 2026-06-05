const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface LLMConfig {
  apiKey?: string;
  model?: string;
}

function getApiKey(): string {
  return process.env.GROQ_API_KEY || "";
}

export async function generatePatientBrief(
  patientData: {
    name: string;
    age: number;
    gender: string;
    department: string;
    allergies: { name: string; severity: string; reaction: string }[];
    conditions: { name: string; status: string }[];
    medications: { name: string; dose: string; route: string; frequency: string }[];
    investigations: { name: string; result: string; status: string }[];
  },
  config?: LLMConfig
): Promise<{ brief: string; model: string }> {
  const apiKey = config?.apiKey || getApiKey();
  if (!apiKey) {
    return { brief: "AI generation unavailable: GROQ_API_KEY not configured. Set it in .env.local or Settings page.", model: "none" };
  }

  const prompt = `You are ClinIQ AI, a clinical summarisation assistant. Generate a structured 60-second clinical brief for the following patient. Format in clear sections. Do NOT add diagnostic conclusions or treatment recommendations — only summarise the provided data.

Patient: ${patientData.name} (${patientData.age}y, ${patientData.gender})
Department: ${patientData.department}

Allergies: ${patientData.allergies.map((a) => `${a.name} (${a.severity}: ${a.reaction})`).join(", ") || "None recorded"}

Active Conditions: ${patientData.conditions.map((c) => `${c.name} [${c.status}]`).join(", ") || "None recorded"}

Medications: ${patientData.medications.map((m) => `${m.name} ${m.dose}, ${m.route}, ${m.frequency}`).join(" | ") || "None recorded"}

Investigations: ${patientData.investigations.map((i) => `${i.name}: ${i.result} (${i.status})`).join(" | ") || "None recorded"}

Generate a brief with sections: SUMMARY, ALLERGIES & ALERTS, ACTIVE CONDITIONS, CURRENT MEDICATIONS, RECENT INVESTIGATIONS.`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config?.model || GROQ_MODEL,
        messages: [
          { role: "system", content: "You are ClinIQ AI — a HIPAA-compliant clinical summarisation assistant. You only summarise provided data. You never add diagnostic conclusions or treatment recommendations." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { brief: `AI generation failed: ${err}`, model: "none" };
    }

    const data = await res.json();
    return {
      brief: data.choices[0].message.content,
      model: data.model,
    };
  } catch (error) {
    return { brief: `AI generation error: ${error instanceof Error ? error.message : "Unknown error"}`, model: "none" };
  }
}

export async function generateWardRoundSummary(
  wardName: string,
  beds: { bed: string; patientName: string; age: number; overnightChanges: string[]; flagSeverity: string }[],
  config?: LLMConfig
): Promise<{ summary: string; model: string }> {
  const apiKey = config?.apiKey || getApiKey();
  if (!apiKey) {
    return { summary: "AI summary unavailable: GROQ_API_KEY not configured.", model: "none" };
  }

  const bedsText = beds
    .map(
      (b) =>
        `${b.bed}: ${b.patientName} (${b.age}y) — Overnight: ${b.overnightChanges.join(", ") || "None"} — Flags: ${b.flagSeverity}`
    )
    .join("\n");

  const prompt = `Summarise the overnight status for ${wardName}:

${bedsText}

Provide a concise ward round handover summary highlighting critical patients, significant overnight changes, and recommended review priorities.`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config?.model || GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a clinical handover assistant. Summarise ward data concisely for shift handover." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { summary: `AI summary failed: ${err}`, model: "none" };
    }

    const data = await res.json();
    return { summary: data.choices[0].message.content, model: data.model };
  } catch (error) {
    return { summary: `AI summary error: ${error instanceof Error ? error.message : "Unknown error"}`, model: "none" };
  }
}
