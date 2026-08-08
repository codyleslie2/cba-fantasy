export function DataCard({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "gold" | "red" }) {
  const color = tone === "gold" ? "text-[#e4bd65]" : tone === "red" ? "text-[#e36f75]" : "text-white";
  return <div className="surface min-w-0 p-4 sm:p-5"><p className="eyebrow">{label}</p><p className={`stat-number mt-3 whitespace-nowrap text-[clamp(1.55rem,7vw,2.25rem)] ${color}`}>{value}</p>{detail && <p className="mt-2 text-xs leading-5 text-[#8f9ba3]">{detail}</p>}</div>;
}
