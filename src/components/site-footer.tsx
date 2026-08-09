"use client";
import { usePathname } from "next/navigation";
export function SiteFooter(){const pathname=usePathname();if(pathname==="/login")return null;return <footer className="mt-24 border-t border-[#292f38] py-10"><div className="container flex flex-wrap justify-between gap-4 text-xs text-[#818a94]"><p>© {new Date().getFullYear()} CBA Fantasy</p><p>Bad decisions, documented since 2017.</p></div></footer>}
