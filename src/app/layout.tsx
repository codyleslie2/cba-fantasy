import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: { default: "CBA League Archive", template: "%s | CBA" }, description: "The history, records, rivalries, and analytics of the CBA fantasy football league." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader/><main>{children}</main><footer className="mt-24 border-t border-[#263442] py-10"><div className="container flex flex-wrap justify-between gap-4 text-xs text-[#77858e]"><p>© {new Date().getFullYear()} CBA League Archive</p><p>Established 2017 · ESPN League 273644</p></div></footer></body></html>;
}
