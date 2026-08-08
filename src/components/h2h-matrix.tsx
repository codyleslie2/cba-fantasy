"use client";

import { useState } from "react";
import { activeManagers, demoInactiveManagers } from "@/data/managers";
import { demoH2H } from "@/data/mock";

const managers = [...activeManagers.slice(0, 9), ...demoInactiveManagers];
export function H2HMatrix() {
  const [selected, setSelected] = useState<{row:number;col:number}|null>({row:0,col:1});
  const detail = selected ? demoH2H(selected.row,selected.col) : null;
  return <div className="grid gap-6 xl:grid-cols-[1fr_300px]"><div className="table-wrap surface"><table><thead><tr><th>Manager</th>{managers.map(m => <th key={m.id} title={m.fullName} className="max-w-16 overflow-hidden text-ellipsis">{m.displayName.slice(0,3).toUpperCase()}</th>)}</tr></thead><tbody>{managers.map((row,ri) => <tr key={row.id}><td className="font-bold">{row.displayName}{row.status === "inactive" && <span className="ml-2 text-[.55rem] text-[#8f9ba3]">G</span>}</td>{managers.map((_,ci) => { const record=demoH2H(ri,ci); const cls=!record?"":record.wins>record.losses?"matrix-win":record.wins<record.losses?"matrix-loss":"matrix-even"; return <td key={ci} className={`matrix-cell text-center ${cls}`} onClick={() => record && setSelected({row:ri,col:ci})}>{record ? `${record.wins}-${record.losses}` : "—"}</td>})}</tr>)}</tbody></table></div>
    <aside className="surface h-fit p-6" aria-live="polite"><p className="eyebrow">Rivalry file</p>{selected && detail ? <><h2 className="display mt-4 text-3xl">{managers[selected.row].displayName}<span className="mx-2 text-[#7d8a92]">vs</span>{managers[selected.col].displayName}</h2><p className="stat-number mt-6 text-5xl text-[#e4bd65]">{detail.wins}–{detail.losses}</p><p className="mt-3 text-sm leading-6 text-[#9ba8b0]">Career series from the row manager’s perspective. Game detail, scoring margin and playoff meetings will appear after ESPN import.</p></> : <p>Select a matchup.</p>}<span className="demo-badge mt-6 inline-block">Demo statistics</span></aside></div>;
}
