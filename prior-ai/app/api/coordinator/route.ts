function safeParse(raw: string | null) {
  try {
    if (!raw) return {};

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (e) {
     console.log("JSON parse error:", raw);
    return {};
  }
}
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Step 1: Clinical extraction
    const clinicalRes = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract diagnosis, symptoms, duration, treatments, confidence. Return ONLY JSON.",
        },
        { role: "user", content: text },
      ],
    });

    const clinicalRaw = clinicalRes.choices[0].message.content;
    const clinical = safeParse(clinicalRaw);

    // Step 2: Policy check
    const policyRes = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a medical insurance policy agent. Decide approval based on clinical data. Return JSON with approved (true/false), reasons, missing requirements.",
        },
        {
          role: "user",
          content: JSON.stringify(clinical),
        },
      ],
    });

    const policyRaw = policyRes.choices[0].message.content;
    const policy = safeParse(policyRaw);
    // Step 3: Final decision logic
    const approved = policy.approved ?? false;

    const finalResult = {
      clinical,
      policy,
      recommendation: approved ? "APPROVE" : "REVIEW REQUIRED",
        confidence:
            approved
                ? clinical.confidence === "high"
                    ? 0.9
                    : clinical.confidence === "moderate"
                    ? 0.75
                    : 0.6
                : 0.5,
            };

    return Response.json({ output: finalResult });
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}