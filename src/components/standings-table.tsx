"use client";

import { useMemo, useState } from "react";
import { demoCareerRecords, managerById } from "@/data/mock";
import type { CareerRecord, ManagerStatus } from "@/types/domain";

type SortKey = keyof Pick<CareerRecord, "wins" | "losses" | "seasons" | "pointsFor" | "pointsAgainst" | "playoffAppearances" | "playoffWins" | "championships"> | "winPct";
const columns: [string, SortKey][] = [["Seasons","seasons"],["W","wins"],["L","losses"],["T","losses"],["Win %","winPct"],["PF","pointsFor"],["PA","pointsAgainst"],["PO Apps","playoffAppearances"],["PO W","playoffWins"],["PO L","playoffWins"],["Finals","playoffAppearances"],["Titles","championships"]];
const pct = (r: CareerRecord) => r.wins / Math.max(1, r.wins + r.losses + r.ties);

export function StandingsTable() {
  const [filter, setFilter] = useState<"all" | ManagerStatus>("all");
  const [sort, setSort] = useState<SortKey>("wins");
  const rows = useMemo(() => demoCareerRecords.filter(r => filter === "all" || managerById.get(r.managerId)?.status === filter).sort((a,b) => (sort === "winPct" ? pct(b)-pct(a) : Number(b[sort])-Number(a[sort]))), [filter,sort]);
  return <><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2">{(["all","active","inactive"] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase ${filter === f ? "border-[#d5a846] bg-[#d5a846] text-black" : "border-[#34434e] text-[#aab5bc]"}`}>{f === "inactive" ? "Graveyard" : f}</button>)}</div><span className="demo-badge">Demo statistics</span></div>
    <div className="table-wrap surface"><table><thead><tr><th>Manager</th><th>Status</th>{columns.map(([label,key],i) => <th key={`${label}-${i}`}><button onClick={() => setSort(key)} className={sort===key?"text-[#e4bd65]":""}>{label}</button></th>)}<th>Last title</th><th>Best</th><th>Worst</th></tr></thead><tbody>{rows.map(r => { const m=managerById.get(r.managerId)!; return <tr key={r.managerId}><td className="font-bold text-white">{m.displayName}</td><td><span className={m.status === "active" ? "text-[#85d5ad]" : "text-[#9aa5ac]"}>{m.status === "active" ? "Active" : "Graveyard"}</span></td><td>{r.seasons}</td><td>{r.wins}</td><td>{r.losses}</td><td>{r.ties}</td><td>{pct(r).toFixed(3)}</td><td>{r.pointsFor.toLocaleString()}</td><td>{r.pointsAgainst.toLocaleString()}</td><td>{r.playoffAppearances}</td><td>{r.playoffWins}</td><td>{r.playoffLosses}</td><td>{r.finalsAppearances}</td><td className="font-bold text-[#e4bd65]">{r.championships}</td><td>{r.lastChampionship ?? "—"}</td><td>{r.bestSeason}</td><td>{r.worstSeason}</td></tr>})}</tbody></table></div></>;
}
