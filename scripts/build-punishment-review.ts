import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { derivePunishmentResult, type PunishmentMatchupInput, type PunishmentResult, type PunishmentTeam } from "../src/lib/punishment-history";

interface Identity { id: string; fullName: string; status: "active" | "inactive"; espnAliases: string[] }
interface IdentityFile { managers: Identity[] }
interface RawTeam { id:number; name?:string; abbrev?:string; owners?:string[]; primaryOwner?:string; record?:{overall?:{wins?:number;losses?:number;ties?:number}}; playoffSeed?:number; rankCalculatedFinal?:number }
interface RawGameSide { teamId:number; totalPoints?:number }
interface RawGame { id:number; matchupPeriodId:number; playoffTierType?:string; winner:string; home?:RawGameSide; away?:RawGameSide }
interface RawSeason { members?:Array<{id:string;displayName:string}>; teams?:RawTeam[]; schedule?:RawGame[] }
interface ReviewArtifact { provisional:boolean; approvalStatus:string; methodology:string; results:PunishmentResult[] }

const root = process.cwd();
const round = (value: number) => Number(value.toFixed(2));

async function main() {
  const identities = JSON.parse(await readFile(resolve(root, "data/manager-identities.json"), "utf8")) as IdentityFile;
  const aliasMap = new Map(identities.managers.flatMap((manager) => manager.espnAliases.map((alias) => [alias, manager] as const)));
  const results: PunishmentResult[] = [];

  for (let year = 2017; year <= 2025; year++) {
    const raw = JSON.parse(await readFile(resolve(root, `data/raw/${year}.json`), "utf8")) as RawSeason;
    const memberNames = new Map<string, string>((raw.members ?? []).map((member: { id: string; displayName: string }) => [member.id, member.displayName]));
    const teams: PunishmentTeam[] = (raw.teams ?? []).map((team) => {
      const ownerIds: string[] = team.owners?.length ? team.owners : team.primaryOwner ? [team.primaryOwner] : [];
      const managers = ownerIds.map((id) => aliasMap.get(memberNames.get(id) ?? "")).filter((manager): manager is Identity => Boolean(manager));
      if (new Set(managers.map((manager) => manager.id)).size !== 1) throw new Error(`${year} ESPN team ${team.id} does not resolve to exactly one approved manager.`);
      const manager = managers[0];
      const record = team.record?.overall ?? {};
      return { teamId: team.id, managerId: manager.id, managerName: manager.fullName, teamName: team.name || team.abbrev || `Team ${team.id}`, wins: record.wins ?? 0, losses: record.losses ?? 0, ties: record.ties ?? 0, regularSeasonFinish: team.playoffSeed ?? null, finalStanding: team.rankCalculatedFinal ?? null };
    });
    const schedule: PunishmentMatchupInput[] = (raw.schedule ?? []).filter((game): game is RawGame & {home:RawGameSide;away:RawGameSide} => Boolean(game.home && game.away)).map((game) => ({ id: game.id, week: game.matchupPeriodId, tier: game.playoffTierType ?? "NONE", winner: game.winner, homeTeamId: game.home.teamId, awayTeamId: game.away.teamId, homeScore: round(game.home.totalPoints ?? 0), awayScore: round(game.away.totalPoints ?? 0) }));
    results.push(derivePunishmentResult(year, teams, schedule));
  }

  const artifact: ReviewArtifact = { provisional: true, approvalStatus: "Commissioner review required before UI integration", methodology: "Candidate is ESPN's absolute bottom final finisher only when the latest LOSERS_CONSOLATION_LADDER matchup pairs final positions 13 and 14 and position 14 loses. Regular-season seed/standing is reported for context but never selects the punishment loser.", results };
  await mkdir(resolve(root, "data/generated"), { recursive: true });
  await writeFile(resolve(root, "data/generated/punishment-history-review.json"), `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  await writeFile(resolve(root, "data/punishment-history-audit.md"), renderAudit(artifact), "utf8");
  console.info(`Generated provisional punishment review for ${results.length} completed seasons; ${results.filter((result) => result.confidence === "high").length} reconcile at high confidence.`);
}

function renderAudit(artifact: ReviewArtifact) {
  const lines = ["# CBA Punishment History — Commissioner Review", "", "> PROVISIONAL: These ESPN-derived candidates are not approved canonical results and are not wired into the website.", "", `Methodology: ${artifact.methodology}`, "", "| Year | Stupidest Loser candidate | Team | Regular season | Place | Consolation | Final punishment matchup | Final score | Confidence / notes |", "|---:|---|---|---:|---:|---:|---|---:|---|"];
  for (const result of artifact.results) {
    const record = result.regularSeasonRecord ? `${result.regularSeasonRecord.wins}-${result.regularSeasonRecord.losses}${result.regularSeasonRecord.ties ? `-${result.regularSeasonRecord.ties}` : ""}` : "—";
    const final = result.finalPunishmentMatchup;
    const path = result.consolationMatchups.map((game) => `W${game.week}: ${game.result} ${game.score.toFixed(2)}-${game.opponentScore.toFixed(2)} vs ${game.opponentName}`).join("; ");
    lines.push(`| ${result.year} | ${result.managerName ?? "Undetermined"} | ${result.teamName ?? "—"} | ${record} | ${result.regularSeasonFinish ?? "—"} | ${result.consolationWins}-${result.consolationLosses}${result.consolationTies ? `-${result.consolationTies}` : ""}: ${path} | ${final ? `W${final.week}, matchup ${final.matchupId} vs ${final.opponentName}` : "—"} | ${final ? `${final.score.toFixed(2)}-${final.opponentScore.toFixed(2)}` : "—"} | ${result.confidence}; ${result.notes.join(" ") || "Bottom-two placement game reconciles cleanly."} |`);
  }
  lines.push("", "## Complete punishment-bracket matchups", "");
  for (const result of artifact.results) {
    lines.push(`### ${result.year}`, "", ...result.bracketMatchups.map((game) => `- Week ${game.week}, matchup ${game.matchupId}: ${game.awayManagerName} ${game.awayScore.toFixed(2)} at ${game.homeManagerName} ${game.homeScore.toFixed(2)} — winner: ${game.winnerName}`), "");
  }
  lines.push("", "## Scope guardrails", "", "- Regular-season standings are context only and never determine the candidate.", "- Punishment games remain excluded from regular-season and championship-playoff statistics.", "- No 2026 result is assigned.", "- `actualPunishment` and `punishmentNotes` remain blank pending commissioner input.", "");
  return lines.join("\n");
}

void main();
