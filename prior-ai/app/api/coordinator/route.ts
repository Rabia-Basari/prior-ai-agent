import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- SAFE PARSER ---------------- */

function safeParse(raw: string | null) {
  try {
    if (!raw) return {};

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) return {};

    const cleaned = raw.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("❌ JSON PARSE FAILED:", raw);
    return {};
  }
}

/* ---------------- NORMALIZERS ---------------- */

function toArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function safeString(value: any) {
  if (!value) return null;
  return String(value);
}

/* ---------------- DEFAULT FALLBACK ---------------- */

function fallbackResponse() {
  return {
    clinical: {
      diagnosis: null,
      symptoms: [],
      duration: null,
      treatments: [],
      severity_hint: "low",
    },
    policy: {
      approved: false,
      reasons: [],
      missing_requirements: [],
      risk_level: "low",
    },
    recommendation: "REVIEW REQUIRED",
    confidence: 0.5,
  };
}

/* ---------------- CLINICAL AGENT ---------------- */

async function clinicalAgent(text: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
You are a Clinical Extraction Agent.

Return ONLY valid JSON:

{
  "diagnosis": string | null,
  "symptoms": string[],
  "duration": string | null,
  "treatments": string[],
  "severity_hint": "low" | "medium" | "high"
}

RULES:
- NO text
- NO markdown
- ONLY JSON
        `,
      },
      { role: "user", content: text },
    ],
  });

  const parsed = safeParse(res.choices[0].message.content);

  return {
    diagnosis: safeString(parsed.diagnosis),
    symptoms: toArray(parsed.symptoms),
    duration: safeString(parsed.duration),
    treatments: toArray(parsed.treatments),
    severity_hint: parsed.severity_hint || "low",
  };
}

/* ---------------- POLICY AGENT ---------------- */

async function policyAgent(clinical: any) {
  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
You are a Medical Policy Agent.

Return ONLY valid JSON:

{
  "approved": boolean,
  "reasons": string[],
  "missing_requirements": string[],
  "risk_level": "low" | "medium" | "high"
}

RULES:
- ONLY JSON
- NO explanations
        `,
      },
      {
        role: "user",
        content: JSON.stringify(clinical),
      },
    ],
  });

  const parsed = safeParse(res.choices[0].message.content);

  return {
    approved: Boolean(parsed.approved),
    reasons: toArray(parsed.reasons),
    missing_requirements: toArray(parsed.missing_requirements),
    risk_level: parsed.risk_level || "low",
  };
}

/* ---------------- DECISION ENGINE ---------------- */

function decisionEngine(clinical: any, policy: any) {
  let breakdown = {
    diagnosis: 0,
    severity: 0,
    treatments: 0,
    policy: 0,
  };

  if (clinical.diagnosis) breakdown.diagnosis = 20;

  if (clinical.severity_hint === "high") breakdown.severity = 20;
  else if (clinical.severity_hint === "medium") breakdown.severity = 15;

  if (clinical.treatments.length > 0) breakdown.treatments = 10;

  if (policy.approved) breakdown.policy = 25;

  const score =
    (breakdown.diagnosis +
    breakdown.severity +
    breakdown.treatments +
    breakdown.policy ) /80*100; // baseline

  const confidence = Math.max(0, Math.min(100, score));

  let recommendation = "REVIEW REQUIRED";
  if (confidence >= 75) recommendation = "APPROVE";
  else if (confidence <= 40) recommendation = "DENY";

  return {
    recommendation,
    confidence,
    breakdown,
  };
}
/* ---------------- API ROUTE ---------------- */

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return Response.json({
        output: fallbackResponse(),
      });
    }

    /* STEP 1 */
    const clinical = await clinicalAgent(text);

    /* STEP 2 */
    const policy = await policyAgent(clinical);

    /* STEP 3 */
    const decision = decisionEngine(clinical, policy);

    const explanation = explainDecision(clinical, policy, decision);

    const timeline = [
  { agent: "Clinical Agent", status: "completed" },
  { agent: "Policy Agent", status: "completed" },
  { agent: "Decision Engine", status: "completed" },
];

const output = {
  clinical,
  policy,
  recommendation: decision.recommendation,
  confidence: decision.confidence / 100,
  breakdown: decision.breakdown,
  explanation,

  // ⭐ NEW: agent timeline
  timeline,
};

    return Response.json({ output });
  } catch (err) {
    console.error("🔥 COORDINATOR ERROR:", err);

    return Response.json({
      output: fallbackResponse(),
    });
  }
}

function explainDecision(clinical: any, policy: any, decision: any) {
  const reasons: string[] = [];

  if (!clinical.diagnosis) {
    reasons.push("No confirmed diagnosis found in clinical note");
  }

  if (!clinical.treatments || clinical.treatments.length === 0) {
    reasons.push("No documented treatment history");
  }

  if (clinical.duration && clinical.duration.includes("week")) {
    reasons.push("Symptoms duration requires further evaluation under policy criteria");
  }

  if (!policy.approved) {
    reasons.push("Policy requirements not fully satisfied for approval");
  }

  return {
    explanation: reasons,
    summary:
      decision.recommendation === "APPROVE"
        ? "Case meets criteria for approval"
        : "Case does not meet required policy guidelines",
  };
}