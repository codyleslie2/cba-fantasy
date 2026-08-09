import { PageHero } from "@/components/page-hero";
import { realManagers } from "@/data/real";

export const metadata = { title: "CBA Graveyard" };

export default function Page() {
  const graveyard = realManagers.filter((manager) => manager.status === "inactive");
  return <>
    <div className="border-b border-[#29323a] bg-[radial-gradient(circle_at_50%_0,#28312e,#080c0d_65%)]">
      <PageHero eyebrow="Former members" title="CBA Graveyard" intro="Gone from the group chat lineup. Still very much in the record book." />
    </div>
    <section className="container mt-12 grid gap-5">
      {graveyard.map((manager) => <article className="surface grid gap-6 border-l-4 border-l-[#66746f] p-7 lg:grid-cols-[1fr_2fr]" key={manager.id}>
        <div><p className="eyebrow">Seasons {manager.firstSeason}–{manager.lastSeason}</p><h2 className="display mt-3 text-4xl text-[#c3cbc6]">{manager.fullName}</h2><p className="mt-3 text-sm text-[#84918d]">{[...new Set(manager.seasonHistory.map((season) => season.teamName))].join(" · ")}</p></div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4"><Stat label="Career" value={`${manager.wins}-${manager.losses}-${manager.ties}`} /><Stat label="Win %" value={manager.winPercentage.toFixed(3)} /><Stat label="Points" value={manager.pointsFor.toFixed(2)} /><Stat label="Playoffs" value={String(manager.playoffAppearances)} /><Stat label="PO Record" value={`${manager.playoffWins}-${manager.playoffLosses}`} /><Stat label="Titles" value={String(manager.championships)} /><Stat label="Stupidest Loser" value={String(manager.punishmentFinishes)} /><Stat label="Punishment W-L" value={`${manager.punishmentBracketWins}-${manager.punishmentBracketLosses}`} /><Stat label="Punishment seasons" value={manager.punishmentSeasons.join(", ")||"None"} /><Stat label="Last season" value={String(manager.lastSeason)} /></div>
      </article>)}
      <p className="text-xs text-[#6f7d78]">Commissioner epitaphs remain optional and blank.</p>
    </section>
  </>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-[#78857f]">{label}</p><b className="stat-number text-2xl">{value}</b></div>;
}
