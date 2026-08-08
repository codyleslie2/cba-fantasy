import { PageHero } from "@/components/page-hero"; import { StandingsTable } from "@/components/standings-table";
export const metadata = { title: "All-Time Standings" };
export default function Page(){return <><PageHero eyebrow="All the receipts" title="All-Time Standings" intro="Every manager’s regular-season and playoff career, sortable however the argument requires."/><section className="container"><StandingsTable/></section></>}
