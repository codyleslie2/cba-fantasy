import type { ChampionshipRecord } from "@/types/cba-data";

export function ChampionshipBanner({ championship, index = 0 }: { championship: ChampionshipRecord; index?: number }) {
  const motion = {
    "--delay": `${index * -1.17}s`,
    "--duration": `${8.4 + (index % 4) * .9}s`,
    "--sway": `${.28 + (index % 3) * .08}deg`,
  } as React.CSSProperties;

  return <article className="banner shrink-0" style={motion} aria-label={`${championship.year} champion ${championship.championName}`}>
    <p className="stat-number text-3xl text-[#f4d681]">{championship.year}</p><div className="my-3 h-px bg-[#e4c06488]"/><p className="text-[.56rem] font-black tracking-[.16em]">CBA<br/>CHAMPION</p><p className="display mt-3 text-base leading-none">{championship.championName}</p><p className="mt-3 text-[.55rem] leading-tight text-[#f4dca2]">{championship.championTeamName}</p>
  </article>;
}

export function BannerRack({ championships, compact = false }: { championships: ChampionshipRecord[]; compact?: boolean }) {
  return <div className={`banner-rack ${compact ? "max-h-[250px]" : ""}`} aria-label="CBA championship banners"><div className="banner-rod" aria-hidden="true"/>{championships.map((c, i) => <ChampionshipBanner championship={c} index={i} key={c.year}/>)}</div>;
}
