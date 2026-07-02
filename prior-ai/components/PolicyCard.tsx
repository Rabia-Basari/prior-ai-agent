export default function PolicyCard({ result }: any) {
  return (
    <div style={card}>
      <h3>📋 Policy Agent</h3>

      <p><b>Status:</b> {result?.policy?.approved ? "APPROVED" : "DENIED"}</p>

      <div>
        <b>Reasons:</b>
        <ul>
          {result?.policy?.reasons?.map((r: string, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 16,
  background: "white",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};