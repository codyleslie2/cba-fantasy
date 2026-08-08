import { PageHero } from "@/components/page-hero"; import { StandingsTable } from "@/components/standings-table";
export const metadata = { title: "All-Time Standings" };
export default function Page(){return <><PageHero eyebrow="The complete ledger" title="All-Time Standings" intro="A sortable accounting of every manager’s CBA career. Demo values prove the layout; only verified ESPN data will enter the official record."/><section className="container"><StandingsTable/></section></>}
