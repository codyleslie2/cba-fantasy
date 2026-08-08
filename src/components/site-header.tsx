import Link from "next/link";

const links = [["/", "Home"], ["/history", "History"], ["/standings", "All-Time"], ["/head-to-head", "H2H"], ["/records", "Records"], ["/owners", "Owners"], ["/graveyard", "Graveyard"], ["/analytics", "Analytics"], ["/recaps", "Recaps"]];

export function SiteHeader() {
  return <header className="sticky top-0 z-50 border-b border-[#263442] bg-[#070b0fe8] backdrop-blur-xl">
    <div className="container flex min-h-16 items-center justify-between gap-6">
      <Link href="/" className="display flex items-center gap-3 text-2xl" aria-label="CBA home"><span className="grid size-10 place-items-center border-2 border-[#d5a846] bg-[#8f242a] text-lg">CBA</span><span className="hidden sm:inline">League Archive</span></Link>
      <nav aria-label="Primary" className="desktop-nav flex items-center gap-5">{links.map(([href, label]) => <Link key={href} href={href} className="text-[.67rem] font-bold uppercase tracking-[.1em] text-[#b8c2c9] hover:text-white">{label}</Link>)}</nav>
      <details className="mobile-nav group relative hidden"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded border border-[#3a4854] px-4 py-2 text-xs font-bold uppercase tracking-widest transition hover:border-[#d5a846] focus-visible:outline-2 focus-visible:outline-[#d5a846]">Menu <span aria-hidden="true" className="ml-2 inline-block transition group-open:rotate-180">⌄</span></summary><nav className="absolute right-0 mt-3 grid w-56 overflow-hidden rounded-sm border border-[#344552] bg-[#0d141b] p-2 shadow-2xl">{links.map(([href,label]) => <Link key={href} href={href} className="flex min-h-11 items-center rounded-sm px-3 py-2.5 text-sm hover:bg-[#18232c] focus-visible:bg-[#18232c]">{label}</Link>)}</nav></details>
    </div>
  </header>;
}
