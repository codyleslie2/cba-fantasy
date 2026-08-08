import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { cbaData } from "@/data/real";
import type { RivalrySummary } from "@/types/cba-data";

export const metadata = { title: "Historical Analytics" };
export default function Page() {
  const rivalries: Array<[string, RivalrySummary]> = [["Most played", cbaData.rivalries.mostPlayed], ["Closest", cbaData.rivalries.closest], ["Most one-sided", cbaData.rivalries.mostOneSided], ["Highest scoring", cbaData.rivalries.highestScoring]];
  const streak = cbaData.rivalries.longestActiveWinningStreak;
  return <><PageHero eyebrow="By the numbers" title="Analytics" intro="The useful trends, weird patterns, and matchup history hiding in the CBA results."/><section className="container"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{rivalries.map(([label, rivalry]) => <article className="surface p-5" key={label}><p className="eyebrow">{label}</p><h2 className="mt-4 text-xl font-bold">{rivalry.label}</h2><p className="mt-3 text-sm text-[#9da5ae]">{rivalry.meetings} meetings · {rivalry.wins}-{rivalry.losses}{rivalry.ties ? `-${rivalry.ties}` : ""}</p></article>)}</div><div className="mt-10 grid gap-6 lg:grid-cols-2"><article className="surface p-6"><SectionHeading kicker="Active run">Longest rivalry streak</SectionHeading><h3 className="text-2xl font-bold">{streak.label}</h3><p className="stat-number mt-3 text-5xl text-[#dfb65f]">{streak.currentStreak}</p></article><article className="surface p-6"><SectionHeading kicker="Methodology">How it works</SectionHeading><p className="text-sm leading-7 text-[#9da5ae]">{cbaData.rivalries.methodology}</p></article></div><div className="mt-10 surface p-8 text-center"><p className="eyebrow">Predictive models</p><h2 className="mt-4 text-3xl font-bold">Championship Odds Coming Soon</h2><p className="mt-3 text-sm text-[#9da5ae]">No made-up probabilities in the meantime.</p></div></section></>;
}
