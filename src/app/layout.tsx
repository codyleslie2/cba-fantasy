import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: { default: "CBA Fantasy", template: "%s | CBA" }, description: "Titles, stats, rivalries, and receipts from the CBA fantasy football league." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader/><main>{children}</main><footer className="mt-24 border-t border-[#292f38] py-10"><div className="container flex flex-wrap justify-between gap-4 text-xs text-[#818a94]"><p>© {new Date().getFullYear()} CBA Fantasy</p><p>Bad decisions, documented since 2017.</p></div></footer></body></html>;
}
