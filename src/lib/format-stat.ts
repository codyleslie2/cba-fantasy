export type StatValueFormat = "number" | "decimal" | "percentage" | "year" | "record" | "rate";

export function formatStatValue(value: number | string, format: StatValueFormat): string {
  if (format === "record" || typeof value === "string") return String(value);
  if (format === "year") return String(Math.trunc(value));
  if (format === "percentage") return `${(value * 100).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  if (format === "rate") return value.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  if (format === "decimal") return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
