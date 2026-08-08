import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvLocal } from "../src/lib/env-local";
import { EspnAccessError, EspnClient, auditSeason, calculateProvisionalStats, historicalCandidates, normalizeSeason, reviewIdentities, type EspnAccessAttempt, type NormalizedEspnSeason } from "../src/lib/espn";

loadEnvLocal();

const leagueId = Number(process.env.ESPN_LEAGUE_ID ?? 273644);
const startYear = Number(process.argv[2] ?? 2017);
const endYear = Number(process.argv[3] ?? new Date().getFullYear());
const cookies = process.env.ESPN_S2 && process.env.SWID ? { espnS2: process.env.ESPN_S2, swid: process.env.SWID } : undefined;
const rawDir = resolve(process.cwd(), "data/raw");
const normalizedDir = resolve(process.cwd(), "data/normalized");

interface FailedSeason { year: number; result: "failed"; attempts: EspnAccessAttempt[]; explanation: string }
const safe = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
const md = (value: unknown) => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");

async function main() {
  console.info(`[CBA ingestion] league=${leagueId}, seasons=${startYear}-${endYear}, authentication=${cookies ? "configured" : "not configured"}`);
  await mkdir(rawDir, { recursive: true });
  await mkdir(normalizedDir, { recursive: true });
  const client = new EspnClient(leagueId, cookies);
  const seasons: NormalizedEspnSeason[] = [];
  const failures: FailedSeason[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    try {
      const raw = await client.fetchSeason(year);
      const season = normalizeSeason(raw);
      seasons.push(season);
      await writeFile(resolve(rawDir, `${year}.json`), safe(raw), "utf8");
      const audit = auditSeason(season);
      console.info(`[${year}] HTTP 200; teams=${audit.teamsFound}; completed=${audit.completedMatchups}; owners=${audit.ownerInfoAvailable}; standings=${audit.standingsAvailable}; playoffs=${audit.playoffInfoAvailable}; champion=${audit.proposedChampion ?? "undetermined"}`);
    } catch (error) {
      const attempts = error instanceof EspnAccessError ? error.attempts : [];
      failures.push({ year, result: "failed", attempts, explanation: error instanceof Error ? error.message : "Unknown ESPN error" });
      console.error(`[${year}] failed; ${attempts.map(a => `${a.endpoint}=HTTP ${a.status}`).join(", ") || "non-HTTP error"}`);
    }
  }

  const identities = reviewIdentities(seasons);
  const audits = seasons.map(auditSeason);
  const candidates = historicalCandidates(identities);
  const provisionalStatistics = calculateProvisionalStats(seasons, identities);
  const report = {
    generatedAt: new Date().toISOString(), league: { name: "CBA", espnLeagueId: leagueId, requestedSeasons: { start: startYear, end: endYear } },
    warnings: ["PROVISIONAL: manager mappings require commissioner approval before production use.", "Raw ESPN responses are local-only and gitignored.", "Authentication values are never stored in these artifacts."],
    successfulSeasons: audits.map(a => a.year), failedSeasons: failures, seasonAudits: audits,
    identityReview: identities, historicalManagerCandidates: candidates, provisionalStatistics,
  };
  await writeFile(resolve(normalizedDir, "cba-history.json"), safe({ generatedAt: report.generatedAt, leagueId, seasons }), "utf8");
  await writeFile(resolve(process.cwd(), "data/import-review.json"), safe(report), "utf8");
  await writeFile(resolve(process.cwd(), "data/import-review.md"), renderMarkdown(report), "utf8");
  console.info(`[CBA ingestion] wrote sanitized review: ${audits.length} successful, ${failures.length} failed, ${candidates.length} historical candidates, ${identities.filter(i => i.classification === "ambiguous").length} ambiguous team-season mappings.`);
  if (failures.length) process.exitCode = 1;
}

function renderMarkdown(report: {
  generatedAt: string; successfulSeasons: number[]; failedSeasons: FailedSeason[];
  seasonAudits: ReturnType<typeof auditSeason>[]; identityReview: ReturnType<typeof reviewIdentities>;
  historicalManagerCandidates: ReturnType<typeof historicalCandidates>; provisionalStatistics: ReturnType<typeof calculateProvisionalStats>;
}) {
  const lines = [
    "# CBA ESPN Import Review", "", `Generated: ${report.generatedAt}`, "",
    "> **PROVISIONAL:** No identity mapping or statistic in this report is approved for production until commissioner review.", "",
    "## Season access and audit", "", "| Season | Access | Teams | Completed | Regular | Playoff | Owners | Standings | Champion |", "|---:|---|---:|---:|---:|---:|---|---|---|",
    ...report.seasonAudits.map(a => `| ${a.year} | HTTP 200 | ${a.teamsFound} | ${a.completedMatchups} | ${a.regularSeasonMatchups} | ${a.playoffMatchups} | ${a.ownerInfoAvailable ? "Yes" : "No"} | ${a.standingsAvailable ? "Yes" : "No"} | ${md(a.proposedChampion)} |`),
    ...report.failedSeasons.map(f => `| ${f.year} | ${md(f.attempts.map(a => `${a.endpoint} HTTP ${a.status} (${a.statusText})`).join("; ") || "Failed")} | — | — | — | — | — | — | — |`), "",
    "## Manager identity review", "", "| Season | Team ID | Team name | ESPN owner ID(s) | Raw owner name(s) | Proposed manager | Confidence | Classification | Notes |", "|---:|---:|---|---|---|---|---|---|---|",
    ...report.identityReview.map(r => `| ${r.season} | ${r.espnTeamId} | ${md(r.teamName)} | ${md(r.espnOwnerIds.join(", "))} | ${md(r.rawOwnerNames.join(", "))} | ${md(r.proposedDisplayName)} | ${r.confidence} | ${r.classification} | ${md(r.notes.join("; "))} |`), "",
    "## Historical manager candidates", "",
    ...(report.historicalManagerCandidates.length ? report.historicalManagerCandidates.map(c => `- **${md(c.rawNames.join(" / ") || c.espnOwnerId)}** — ESPN ID \`${c.espnOwnerId}\`; seasons ${c.seasons.join(", ")}; teams: ${md(c.teamNames.join(", "))}${c.ambiguous ? "; **ambiguous ownership record**" : ""}`) : ["None discovered."]), "",
    "## Season champions and playoff audit", "",
    ...report.seasonAudits.map(a => `### ${a.year}\n\n- Proposed champion: **${md(a.proposedChampion)}**\n- Completed playoff matchups: ${a.playoffMatchups}\n- Notes: ${md(a.notes.join("; ") || "None")}\n\n${a.playoffResults.map(p => `- Week ${p.week}: ${md(p.awayTeam)} ${p.awayScore} at ${md(p.homeTeam)} ${p.homeScore} — winner: ${md(p.winner)}`).join("\n")}`), "",
    "## Provisional all-time statistics", "", "| Manager identity | Status | W | L | T | Win % | PF | PA | PO apps | PO W | PO L | Finals | Titles |", "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...report.provisionalStatistics.managers.sort((a,b) => b.wins-a.wins).map(s => `| ${md(s.displayName)} | ${s.classification} | ${s.wins} | ${s.losses} | ${s.ties} | ${s.winPercentage.toFixed(3)} | ${s.pointsFor.toFixed(2)} | ${s.pointsAgainst.toFixed(2)} | ${s.playoffAppearances} | ${s.playoffWins} | ${s.playoffLosses} | ${s.finalsAppearances} | ${s.championships} |`), "",
    "## Provisional head-to-head", "", "| Manager key | Opponent key | W | L | T |", "|---|---|---:|---:|---:|",
    ...report.provisionalStatistics.headToHead.map(h => `| ${md(h.manager)} | ${md(h.opponent)} | ${h.wins} | ${h.losses} | ${h.ties} |`), "",
    "## Authentication and privacy", "", "`.env.local` is gitignored. ESPN cookies are read only to construct request headers and are never written to logs or artifacts. Raw responses are stored under gitignored `data/raw/`.", "",
    "## Failed endpoint detail", "",
    ...(report.failedSeasons.length ? report.failedSeasons.flatMap(f => [`### ${f.year}`, "", ...f.attempts.map(a => `- ${a.endpoint}: HTTP ${a.status} ${md(a.statusText)} — \`${a.url}\``), ""]) : ["No failed seasons.", ""]),
  ];
  return lines.join("\n");
}

void main();
