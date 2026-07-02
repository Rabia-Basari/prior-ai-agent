
"use client";

import { useState } from "react";

import PatientCard from "@/components/PatientCard";
import AgentTimeline from "@/components/AgentTimeline";
import ClinicalCard from "@/components/ClinicalCard";
import PolicyCard from "@/components/PolicyCard";
import DecisionCard from "@/components/DecisionCard";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState("Initializing agents...");
  const [timelineState, setTimelineState] = useState<any[]>([]);
  const [stage, setStage] = useState<"idle" | "clinical" | "policy" | "final">("idle");

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
};

  const analyze = async () => {
    try {
      setLoading(true);
      setResult(null);
      setLogs([]); // reset logs each run

      addLog("Request received");
      setStage("clinical");
      setLoadingText("🧠 Clinical Agent analyzing patient data...");
      addLog("Clinical Agent started");
      
      const res = await fetch("/api/coordinator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      addLog("API call completed");

      const data = await res.json();

      addLog("Policy Agent evaluating rules");

    setTimeout(() => {
      setStage("policy");
      addLog("Policy Agent completed");
    }, 400);

setTimeout(() => {
      setStage("final");
      addLog("Decision Engine calculating score");
    }, 900);

    setTimeout(() => {
      setResult(data.output);
      addLog("Final decision generated");
      setLoading(false);
    }, 1300);

  } catch (e) {
    addLog("ERROR: API failed");
    setResult({ error: "API failed" });
    setLoading(false);
  }
};

  return (
    <main
  style={{
    padding: "32px 24px",
    fontFamily: "Inter, system-ui, sans-serif",
    background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
    minHeight: "100vh",
    color: "#0f172a",
  }}
  >
    <div
  style={{
    maxWidth: 1100,
    margin: "0 auto",
  }}
>
  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 16,
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      marginBottom: 20,
      border: "1px solid #e2e8f0",
    }}
  >
    <h1 style={{ margin: 0, fontSize: 22 }}>
      🧠 PriorAI
    </h1>
    <p style={{ margin: "6px 0 0", color: "#64748b" }}>
      AI Multi-Agent Prior Authorization System
    </p>
  </div>

      <h1>🧠 PriorAI - Agentic Healthcare Assistant</h1>

      <p style={{ color: "#64748b" }}>
  Simulating real-world insurance prior authorization workflow using AI agents
</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste clinical notes..."
        style={input}
      />

      <button onClick={analyze} style={button} disabled={loading}>
       {loading ? loadingText : "Analyze Case"}
      </button>

      {loading && (
  <div
    style={{
      marginTop: 20,
      padding: 15,
      background: "#0f172a",
      color: "white",
      borderRadius: 12,
      animation: "pulse 1.5s infinite",
    }}
  >
    {loadingText}
  </div>
)}

<div style={{ fontSize: 12, opacity: 0.6 }}>
  🧠 AI Reasoning Engine v1.0 • Multi-Agent Mode Active
</div>

      <div style={grid}>
        <PatientCard result={result} />
        <AgentTimeline stage={stage} timelineState={timelineState} />
        <ClinicalCard result={result} />
        <PolicyCard result={result} />
        <DecisionCard result={result} />
        <p>
  Bias Check: Clinical evidence + Policy constraints combined
</p>
      </div>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  padding: 30,
  fontFamily: "Arial",
  background: "#f5f7fb",
  minHeight: "100vh",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 20,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const button: React.CSSProperties = {
  marginTop: 15,
  width: "100%",
  padding: 14,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
};

const grid: React.CSSProperties = {
  marginTop: 25,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 16,
};

