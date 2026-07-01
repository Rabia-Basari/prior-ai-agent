import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
  `You are a clinical extraction engine.
Return ONLY valid JSON in this exact format:

{
  "diagnosis": "",
  "symptoms": [],
  "duration": "",
  "treatments": [],
  "confidence": "low | moderate | high"
}

No markdown. No explanation. Only JSON.`,
            
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

const raw = completion.choices[0].message.content;

// remove markdown ```json
const cleaned = raw
  ?.replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return Response.json({
  output: JSON.parse(cleaned || "{}"),
});
  } catch (err: any) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}