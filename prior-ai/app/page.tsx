"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    try {
      const res = await fetch("/api/coordinator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setResult(data.output);
    } catch (err) {
      setResult("Error calling API");
    }
  };

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>🧠 PriorAI - Agentic Healthcare Assistant</h1>

      <textarea
        rows={6}
        style={{ width: "100%", marginTop: 20 }}
        placeholder="Paste clinical notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />

      <button
        onClick={analyze}
        style={{ marginTop: 20, padding: "10px 20px" }}
      >
        Analyze
      </button>

<div style={{ marginTop: 20, display: "grid", gap: 20 }}>

  <div style={{ padding: 15, background: "#eef", borderRadius: 8 }}>
    <h3>🧠 Clinical Analysis</h3>
    <pre>{JSON.stringify(result?.clinical, null, 2)}</pre>
  </div>

  <div style={{ padding: 15, background: "#efe", borderRadius: 8 }}>
    <h3>📋 Policy Decision</h3>
    <pre>{JSON.stringify(result?.policy, null, 2)}</pre>
  </div>

  <div style={{ padding: 15, background: "#ffe", borderRadius: 8 }}>
    <h3>🏁 Final Recommendation</h3>
    <p><b>{result?.recommendation}</b></p>
    <p>Confidence: {result?.confidence}</p>
  </div>

</div>
    </main>
  );
}