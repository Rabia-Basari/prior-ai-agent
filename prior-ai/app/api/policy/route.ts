import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeParse(raw: string | null | undefined) {
  try {
    if (!raw) {
      return {
        approved: false,
        approval_score: 0,
        reasons: ["Empty response"],
        missing_requirements: [],
        evidence: [],
        risk_level: "High",
      };
    }

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // 🔥 Force reasons to always be array
    if (typeof parsed.reasons === "string") {
      parsed.reasons = [parsed.reasons];
    }

    if (!Array.isArray(parsed.reasons)) {
      parsed.reasons = [];
    }
    if (typeof parsed.missing_requirements === "string") {
      parsed.missing_requirements = [parsed.missing_requirements];
    }

    if (!Array.isArray(parsed.missing_requirements)) {
      parsed.missing_requirements = [];
    }

    if (!Array.isArray(parsed.evidence)) {
      parsed.evidence = [];
    }

    return {
      approved: parsed.approved ?? false,
      approval_score: parsed.approval_score ?? 0,
      reasons: parsed.reasons,
      missing_requirements: parsed.missing_requirements,
      evidence: parsed.evidence,
      risk_level: parsed.risk_level ?? "Medium",
    };
  } catch (e) {
    console.log("Policy JSON error:", raw);

    return {
      approved: false,
      approval_score: 0,
      reasons: ["Invalid JSON from model"],
      missing_requirements: [],
      evidence: [],
      risk_level: "High",
    };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clinicalData = body.clinicalData || body;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are an experienced health insurance prior authorization reviewer.

Your job is to evaluate medical necessity for insurance approval.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text

OUTPUT FORMAT:

{
  "approved": true,
  "approval_score": 0-100,
  "reasons": ["short reason 1", "short reason 2"],
  "missing_requirements": ["missing item"],
  "evidence": ["supporting evidence"],
  "risk_level": "Low | Medium | High"
}

RULES:
- reasons MUST be an ARRAY of short strings (max 15 words each)
- missing_requirements MUST be an ARRAY
- evidence MUST be an ARRAY
- approval_score MUST be number between 0-100
          `,
        },
        {
          role: "user",
          content: JSON.stringify(clinicalData),
        },
      ],
    });

    const raw = completion.choices[0].message.content;

    return Response.json({
      output: safeParse(raw),
    });
  } catch (err: any) {
    return Response.json(
      {
        output: {
          approved: false,
          approval_score: 0,
          reasons: ["System error"],
          missing_requirements: [],
          evidence: [],
          risk_level: "High",
        },
      },
      { status: 500 }
    );
  }
}