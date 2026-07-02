export default function DecisionCard({ result }: any) {
  if (!result) return null;

  const confidence = Math.round((result?.confidence || 0) * 100);

  return (
    <div style={card}>
      <h3>🏁 Final Decision</h3>

      <div style={badge(result?.recommendation)}>
        {result?.recommendation}
        {result?.explanation && (
  <div
    style={{
      marginTop: 16,
      padding: 12,
      background: "#fff7ed",
      borderRadius: 10,
      border: "1px solid #fed7aa",
    }}
  >
    <h4>🧠 Why this decision?</h4>

    <ul>
      {result.explanation.explanation?.map((r: string, i: number) => (
        <li key={i}>{r}</li>
      ))}
    </ul>

    <p style={{ marginTop: 8, fontWeight: 600 }}>
      {result.explanation.summary}
    </p>
  </div>
)}
      </div>

      <p style={{ marginTop: 10 }}>
        <b>Confidence:</b> {confidence}%
      </p>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 16,
  background: "white",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

function badge(type: string) {
  return {
    padding: 10,
    borderRadius: 8,
    color: "Black",
    background:
      type === "APPROVE"
        ? "#16a34a"
        : type === "DENY"
        ? "#dc2626"
        : "#eab308",
    textAlign: "center" as const,
    fontWeight: "bold",
    
  };
}