"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth-actions";

const links = [["/", "Home"], ["/history", "History"], ["/standings", "All-Time"], ["/head-to-head", "H2H"], ["/records", "Records"], ["/owners", "Owners"], ["/graveyard", "Graveyard"], ["/analytics", "Analytics"], ["/recaps", "Season Recaps"]];

export function SiteHeader() {
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  if (pathname === "/login") return null;
  return <header className="sticky top-0 z-50 border-b border-[#292f38] bg-[#0b0d10e8] backdrop-blur-xl">
    <div className="container flex min-h-16 items-center justify-between gap-6">
      <Link href="/" className="brand-lockup" aria-label="CBA home"><span className="brand-badge">CBA</span><span className="brand-title">CBA Fantasy</span></Link>
      <nav aria-label="Primary" className="desktop-nav flex items-center gap-1">{links.map(([href, label]) => <Link key={href} href={href} className={`rounded-lg px-3 py-2 text-[.78rem] font-semibold transition ${active(href)?"bg-[#252b33] text-[#e4bd65]":"text-[#aeb5bd] hover:bg-[#1b2028] hover:text-white"}`}>{label}</Link>)}<form action={logoutAction}><button className="logout-button" type="submit">Log out</button></form></nav>
      <details className="mobile-nav group relative hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-[#3a424c] px-4 py-2 text-sm font-semibold transition hover:border-[#d6a84b]">Menu <span aria-hidden="true" className="ml-2 inline-block transition group-open:rotate-180">⌄</span></summary><nav className="absolute right-0 mt-3 grid w-56 overflow-hidden rounded-xl border border-[#343b45] bg-[#15191f] p-2 shadow-2xl">{links.map(([href,label]) => <Link key={href} href={href} className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm ${active(href)?"bg-[#252b33] text-[#e4bd65]":"hover:bg-[#1f242c]"}`}>{label}</Link>)}<form action={logoutAction}><button className="logout-button mobile-logout" type="submit">Log out</button></form></nav></details>
    </div>
  </header>;
}
