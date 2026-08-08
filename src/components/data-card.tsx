export function DataCard({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "gold" | "red" }) {
  const color = tone === "gold" ? "text-[#e4bd65]" : tone === "red" ? "text-[#e36f75]" : "text-white";
  return <div className="surface p-5"><p className="eyebrow">{label}</p><p className={`stat-number mt-3 text-4xl ${color}`}>{value}</p>{detail && <p className="mt-2 text-xs text-[#8f9ba3]">{detail}</p>}</div>;
}
