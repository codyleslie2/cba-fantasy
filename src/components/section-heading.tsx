export function SectionHeading({ kicker, children, aside }: { kicker: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div className="min-w-0 flex-1"><p className="eyebrow mb-2">{kicker}</p><h2 className="display rule-title section-title">{children}</h2></div>{aside}</div>;
}
