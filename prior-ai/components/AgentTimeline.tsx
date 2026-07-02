export default function AgentTimeline({ stage, timelineState }: any) {
  const agents = timelineState?.length
    ? timelineState
    : [
        { agent: "Clinical Agent", status: stage === "idle" ? "idle" : "completed" },
        { agent: "Policy Agent", status: stage === "final" ? "completed" : "idle" },
        { agent: "Decision Engine", status: stage === "final" ? "completed" : "idle" },
      ];

  return (
    <div style={{ padding: 16, background: "white", borderRadius: 12 }}>
      <h3>🤖 Agent Timeline</h3>

      {agents.map((a: any, i: number) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
          }}
        >
          <span>{a.agent}</span>

          <span
            style={{
              color:
                a.status === "completed"
                  ? "green"
                  : a.status === "running"
                  ? "orange"
                  : "gray",
              fontWeight: "bold",
            }}
          >
            {a.status === "completed"
              ? "✔"
              : a.status === "running"
              ? "⏳"
              : "-"}
          </span>
        </div>
      ))}
    </div> );

    
}