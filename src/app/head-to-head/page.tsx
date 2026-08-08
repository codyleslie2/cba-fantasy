import { PageHero } from "@/components/page-hero"; import { H2HMatrix } from "@/components/h2h-matrix";
export const metadata={title:"Head-to-Head"}; export default function Page(){return <><PageHero eyebrow="Settle the argument" title="Head-to-Head" intro="Every matchup between every manager. Pick a cell and bring the receipts."/><section className="container"><H2HMatrix/></section></>}
