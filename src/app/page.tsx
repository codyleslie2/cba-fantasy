import Link from "next/link";
import { BannerRack } from "@/components/championship-banner";
import { SectionHeading } from "@/components/section-heading";
import { cbaData, managerById } from "@/data/real";

export default function Home() {
  const recent = cbaData.championships.at(-1)!;
  const rivalry = cbaData.rivalries.mostPlayed;
  const metrics = [
    [String(cbaData.league.firstSeason), "Established"],
    [String(cbaData.managers.length), "All-Time Managers"],
    [String(cbaData.championships.length), "Completed Seasons"],
    [String(cbaData.championships.length), "Championships Awarded"],
  ];

  return <>
    <section className="container grid min-h-[430px] items-center gap-9 py-10 sm:py-14 lg:grid-cols-[1.15fr_.85fr]">
      <div>
        <p className="eyebrow mb-4">CBA since 2017</p>
        <h1 className="display text-[clamp(5rem,14vw,8.5rem)] leading-[.78]">CBA</h1>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#f3f4f1] sm:text-4xl">Fantasy football since 2017.</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#a5adb6] sm:text-lg">10 seasons of bad trades, worse lineup decisions, and documented receipts.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/history" className="flex min-h-11 items-center rounded-lg bg-[#d6a84b] px-5 py-3 text-sm font-bold text-[#17130b] transition hover:bg-[#e3b95f]">League History</Link>
          <Link href="/standings" className="flex min-h-11 items-center rounded-lg border border-[#46505b] bg-[#171b21] px-5 py-3 text-sm font-bold transition hover:border-[#68727d] hover:bg-[#1d2229]">All-Time Standings</Link>
        </div>
      </div>
      <aside className="surface p-5 sm:p-7">
        <p className="eyebrow">League at a Glance</p>
        <div className="mt-5 grid grid-cols-2 gap-3">{metrics.map(([value,label])=><div className="rounded-xl border border-[#292f38] bg-[#11151a] p-4" key={label}><b className="stat-number text-3xl text-[#f3f4f1] sm:text-4xl">{value}</b><p className="mt-1 text-xs leading-5 text-[#929ba5]">{label}</p></div>)}</div>
      </aside>
    </section>

    <section className="border-y border-[#292f38] bg-[#0e1115] py-11 sm:py-14"><div className="container"><SectionHeading kicker="CBA Champions">Championship Rafters</SectionHeading><BannerRack championships={cbaData.championships}/></div></section>

    <section className="container py-12 sm:py-16">
      <div className="grid gap-9 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><SectionHeading kicker="2026 season">Current Standings</SectionHeading><span className="rounded-[999px] border border-[#d6a84b55] bg-[#d6a84b12] px-3 py-1 text-[.68rem] font-bold tracking-wide text-[#dfbb70]">Current · In Progress</span></div>
          <div className="surface divide-y divide-[#292f38] overflow-hidden">{cbaData.currentStandings.slice(0,8).map((r,i)=><div key={r.managerId} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[35px_minmax(0,1fr)_auto_auto] sm:px-5"><b className="stat-number text-lg text-[#7f8994]">{i+1}</b><div className="min-w-0"><b className="text-sm">{r.managerName}</b><p className="truncate text-xs text-[#858e98]">{r.teamName}</p></div><b className="text-sm">{r.wins}-{r.losses}</b><span className="hidden text-xs text-[#9da5ae] sm:inline">{r.pointsFor.toFixed(2)}</span></div>)}</div>
          <p className="mt-3 text-xs leading-5 text-[#7f8994]">2026 is underway; completed games will appear here.</p>
        </div>
        <div>
          <SectionHeading kicker="Latest Champion">2025 Title</SectionHeading>
          <div className="surface p-6 sm:p-7"><p className="text-3xl font-extrabold tracking-tight text-[#e3bd71]">{recent.championName}</p><p className="mt-2 text-base text-[#c7ccd1]">{recent.championTeamName}</p><p className="stat-number mt-6 text-4xl sm:text-5xl">{recent.championScore}–{recent.runnerUpScore}</p><p className="mt-2 text-sm text-[#929ba5]">over {recent.runnerUpName}</p></div>
          <div className="surface mt-5 p-6"><p className="eyebrow">Most Played Rivalry</p><h3 className="mt-3 text-2xl font-extrabold tracking-tight">{rivalry.label}</h3><p className="mt-2 text-sm text-[#9da5ae]">{rivalry.meetings} meetings · {managerById.get(rivalry.managerId)?.fullName} leads {rivalry.wins}-{rivalry.losses}</p><Link href="/head-to-head" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#dfb65f]">Open the matchup →</Link></div>
        </div>
      </div>
      <div className="mt-11 grid gap-5 md:grid-cols-3">
        <article className="surface p-6"><p className="eyebrow">League Record</p><h3 className="mt-4 text-xl font-bold">Highest score</h3><p className="stat-number mt-2 text-3xl text-[#e0b967]">{cbaData.records[0].value} points</p><p className="mt-2 text-sm text-[#929ba5]">{cbaData.records[0].managerName}, {cbaData.records[0].year}</p></article>
        <article className="surface p-6"><p className="eyebrow">Analytics</p><h3 className="mt-4 text-xl font-bold">League trends</h3><Link href="/analytics" className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-[#dfb65f]">See the numbers →</Link></article>
        <article className="surface p-6"><p className="eyebrow">Weekly Recaps</p><h3 className="mt-4 text-xl font-bold">Coming Soon</h3><p className="mt-3 text-sm text-[#929ba5]">Commissioner-authored recaps will live here.</p></article>
      </div>
    </section>
  </>;
}
