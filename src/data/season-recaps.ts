import factsJson from "../../data/generated/season-recap-facts.json";
import editorialJson from "../../data/season-recaps/editorial.json";
import managerSummariesJson from "../../data/season-recaps/manager-summaries.json";
import type { RecapEditorial, RecapSeasonFacts } from "@/types/season-recap";

export const completedRecapYears=[2025,2024,2023,2022,2021,2020,2019,2018,2017] as const;
const facts=(factsJson as {seasons:RecapSeasonFacts[]}).seasons;
const editorial=Object.fromEntries(Object.entries(editorialJson).map(([year,copy])=>[year,{...copy,managerSummaries:(managerSummariesJson as Record<string,Record<string,string>>)[year]}])) as Record<string,RecapEditorial>;
export const seasonRecaps=new Map(facts.map(season=>[season.year,{facts:season,editorial:editorial[String(season.year)]}]));
