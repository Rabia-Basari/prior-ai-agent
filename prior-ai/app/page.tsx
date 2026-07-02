"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<
  { label: string; status: "pending" | "active" | "done" }[]
>([]);
  

const analyze = async () => {
  try {
    setLoading(true);
    setResult(null);

    const steps = [
      "🧠 Clinical Agent analyzing symptoms...",
      "📋 Policy Agent evaluating guidelines...",
      "⚖️ Decision Engine calculating score...",
      "🏁 Final decision generated",
    ];

    // init timeline
    setTimeline(
      steps.map((s, i) => ({
        label: s,
        status: i === 0 ? "active" : "pending",
      }))
    );

    // animate steps
for (let i = 0; i < steps.length; i++) {
  await new Promise((r) => setTimeout(r, 700));

  setTimeline((prev) =>
    prev.map((item, idx) => {
      if (idx < i) return { ...item, status: "done" };
      if (idx === i) return { ...item, status: "active" };
      return item;
    })
  );
}

    const res = await fetch("/api/coordinator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setResult(data.output);

    // mark all done
    setTimeline((prev) =>
      prev.map((item) => ({ ...item, status: "done" }))
    );
  } catch (err) {
    setResult({ error: "API call failed" });
  } finally {
    setLoading(false);
  }
};

  const confidence = Number(result?.confidence ?? 0);
  return (
    <main
      style={{
        padding: 40,
        fontFamily: "Arial",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <h1>🧠 PriorAI - Agentic Healthcare Assistant</h1>

      {/* INPUT */}
      <textarea
        rows={6}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
        placeholder="Paste clinical notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* BUTTON */}
      <button
        onClick={analyze}
        disabled={loading}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "14px",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Case"}
      </button>

      {/* AGENT TIMELINE */}
      {timeline.length > 0 && (
        <div
          style={{
          marginTop: 20,
          padding: 15,
          background: "#0f172a",
          borderRadius: 10,
          color: "white",
          }}
        >
        <h3>🧠 Agent Timeline</h3>

        {timeline.map((step, index) => (
          <div
            key={index}
style={{
  padding: "10px 0",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 10,

  opacity: step.status === "pending" ? 0.3 : 1,

  color:
    step.status === "done"
      ? "#22c55e"
      : step.status === "active"
      ? "#60a5fa"
      : "#94a3b8",

  fontWeight: step.status === "active" ? "bold" : "normal",

  animation:
      step.status === "active" ? "pulse 1s infinite" : "none",
}}
          >
<span style={{ width: 20, display: "inline-block" }}>
  {step.status === "done" && "✔"}
  {step.status === "active" && "⚡"}
  {step.status === "pending" && "○"}
</span>
          {step.label}
            </div>
            ))}
          </div>
        )}

      {/* LOADING STATE */}
      {loading && (
        <div style={{ marginTop: 20, color: "#555" }}>
          🧠 Agents are processing clinical + policy evaluation...
        </div>
      )}

      {/* ERROR STATE */}
      {result?.error && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
          }}
        >
          ❌ {result.error}
        </div>
      )}

      {/* RESULT DASHBOARD */}
      {result && !result.error && (
        <div style={{ marginTop: 30, display: "grid", gap: 20 }}>
          
          {/* FINAL DECISION CARD */}
          <div
            style={{
              padding: 24,
              borderRadius: 12,
              color: "white",
              textAlign: "center",
              fontSize: 22,
              fontWeight: "bold",
              background:
                result.recommendation === "APPROVE"
                  ? "#16a34a"
                  : result.recommendation === "DENY"
                  ? "#dc2626"
                  : "#eab308",
            }}
          >
            {result.recommendation}
          </div>

          {/* CONFIDENCE */}
          <div style={cardStyle}>
            <h3>📊 Confidence Score</h3>

            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              {Math.round(Number(result?.confidence ?? 0))}%
            </div>

            <div style={barContainer}>
              <div
                style={{
                  width: `${confidence * 100}%`,
                  height: "100%",
                  background:
                    confidence > 0.7
                      ? "#16a34a"
                      : confidence > 0.4
                      ? "#eab308"
                      : "#dc2626",
                }}
              />
            </div>
          </div>

          {/* SCORE BREAKDOWN */}
          <div style={cardStyle}>
            <h3>📊 Decision Breakdown</h3>

            <p>Diagnosis Impact: {result?.breakdown?.diagnosis ?? 0}</p>

            <p>Severity Impact: {result?.breakdown?.severity ?? 0}</p>

            <p>Treatment Impact: {result?.breakdown?.treatments ?? 0}</p>

            <p>Policy Impact: {result?.breakdown?.policy ?? 0}</p>

            <div style={{ marginTop: 10 }}>
              <strong>Total Score:</strong>{" "}
              {Math.round(result?.confidence ?? 0)}
            </div>
            </div>
          {/* CLINICAL */}
          <div style={cardStyle}>
            <h3>🧠 Clinical Agent</h3>

            <p><b>Diagnosis:</b> {result.clinical?.diagnosis ?? "N/A"}</p>
            <p>
              <b>Symptoms:</b>{" "}
              {result.clinical?.symptoms?.join(", ") || "N/A"}
            </p>
            <p><b>Duration:</b> {result.clinical?.duration ?? "N/A"}</p>
            <p><b>Severity:</b> {result.clinical?.severity_hint ?? "low"}</p>
          </div>

          {/* POLICY */}
          <div style={cardStyle}>
            <h3>📋 Policy Agent</h3>

            <p>
              <b>Status:</b>{" "}
              {result.policy?.approved ? "APPROVED" : "DENIED"}
            </p>

            <div>
              <b>Reasons:</b>
              <ul>
                {result.policy?.reasons?.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <b>Missing Requirements:</b>
              <ul>
                {result.policy?.missing_requirements?.map(
                  (r: string, i: number) => (
                    <li key={i}>{r}</li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------- STYLES ---------------- */

const cardStyle: React.CSSProperties = {
  padding: 20,
  background: "white",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const barContainer: React.CSSProperties = {
  height: 10,
  background: "#e5e7eb",
  borderRadius: 5,
  marginTop: 8,
  overflow: "hidden",
};