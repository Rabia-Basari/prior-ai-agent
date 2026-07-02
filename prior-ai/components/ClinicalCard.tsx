export default function ClinicalCard({ result }: any) {
  return (
    <div style={card}>
      <h3>🧠 Clinical Agent</h3>

      <p><b>Diagnosis:</b> {result?.clinical?.diagnosis || "N/A"}</p>
      <p><b>Symptoms:</b> {result?.clinical?.symptoms?.join(", ")}</p>
      <p><b>Duration:</b> {result?.clinical?.duration}</p>
      <p><b>Severity:</b> {result?.clinical?.severity_hint}</p>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 16,
  background: "white",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};