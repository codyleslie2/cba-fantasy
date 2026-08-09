import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "CBA Fantasy", template: "%s | CBA Fantasy" }, description: "Private fantasy league website.",
  robots: { index:false, follow:false, noarchive:true, googleBot:{ index:false, follow:false, noarchive:true } },
  openGraph: { title:"CBA Fantasy", description:"Private fantasy league website.", type:"website" },
  twitter: { card:"summary", title:"CBA Fantasy", description:"Private fantasy league website." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader/><main>{children}</main><SiteFooter/></body></html>;
}
