import { managerById } from "@/data/mock";
import type { Championship } from "@/types/domain";

export function ChampionshipBanner({ championship, index = 0 }: { championship: Championship; index?: number }) {
  const manager = managerById.get(championship.managerId);
  return <article className="banner shrink-0" style={{ "--delay": `${index * -.73}s` } as React.CSSProperties} aria-label={`${championship.year} champion ${manager?.displayName ?? "TBD"}`}>
    <p className="stat-number text-3xl text-[#f4d681]">{championship.year}</p><div className="my-3 h-px bg-[#e4c06488]"/><p className="text-[.56rem] font-black tracking-[.16em]">CBA<br/>CHAMPION</p><p className="display mt-4 text-lg leading-none">{manager?.displayName ?? "TBD"}</p>
  </article>;
}

export function BannerRack({ championships, compact = false }: { championships: Championship[]; compact?: boolean }) {
  return <div className={`banner-rack ${compact ? "max-h-[250px]" : ""}`} aria-label="CBA championship banners">{championships.map((c, i) => <ChampionshipBanner championship={c} index={i} key={c.id}/>)}</div>;
}
