import Link from "next/link";
import type { ChampionshipRecord } from "@/types/cba-data";

export function ChampionshipBanner({ championship, index = 0 }: { championship: ChampionshipRecord; index?: number }) {
  const nameParts = championship.championName.trim().split(/\s+/);
  const lastName = nameParts.pop() ?? "";
  const firstName = nameParts.join(" ");
  const longTeamName = championship.championTeamName.trim().length > 20;
  const motion = {
    "--delay": `${index * -1.07}s`,
    "--duration": `${5.4 + (index % 4) * .75}s`,
    "--sway": `${1.55 + (index % 4) * .22}deg`,
  } as React.CSSProperties;

  return <Link href={`/recaps/${championship.year}`} className="banner-link shrink-0" aria-label={`View the ${championship.year} CBA season recap`}>
    <article className="banner-shell" aria-label={`${championship.year} champion ${championship.championName}`}>
      <span className="banner-hardware" aria-hidden="true"/>
      <div className="banner-fabric" style={motion}>
        <div className="banner-year display">{championship.year}</div>
        <div className="banner-divider"/>
        <div className="banner-label">CBA Champion</div>
        <div className="banner-name"><span>{firstName}</span><span>{lastName}</span></div>
        <div className={`banner-team ${longTeamName ? "banner-team-long" : ""}`}><span>{championship.championTeamName}</span></div>
      </div>
      <span className="banner-view-season">View Season →</span>
    </article>
  </Link>;
}

export function BannerRack({ championships, compact = false }: { championships: ChampionshipRecord[]; compact?: boolean }) {
  const newestFirst = [...championships].sort((a, b) => b.year - a.year);
  return <div className={`banner-rack ${compact ? "max-h-[270px]" : ""}`} aria-label="CBA championship banners, newest first"><div className="banner-rod" aria-hidden="true"/><div className="banner-rack-track">{newestFirst.map((c, i) => <ChampionshipBanner championship={c} index={i} key={c.year}/>)}</div></div>;
}
