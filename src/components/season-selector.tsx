"use client";
import { useRouter } from "next/navigation";
import { completedRecapYears } from "@/data/season-recaps";

export function SeasonSelector({year}:{year:number}){
  const router=useRouter();
  return <label className="flex items-center gap-3 text-sm font-semibold"><span className="text-[#9da5ae]">Season</span><select value={year} onChange={event=>router.push(`/recaps/${event.target.value}`)} className="min-h-11 rounded-lg border border-[#3b434d] bg-[#171b21] px-4 text-white focus:border-[#d6a84b]">{completedRecapYears.map(value=><option value={value} key={value}>{value}</option>)}</select></label>;
}
