import { PageHero } from "@/components/page-hero"; import { StandingsTable } from "@/components/standings-table";
export const metadata = { title: "All-Time Standings" };
export default function Page(){return <><PageHero eyebrow="The complete ledger" title="All-Time Standings" intro="A sortable accounting of every permanent manager’s verified CBA regular-season and postseason career."/><section className="container"><StandingsTable/></section></>}
