/* eslint-disable @typescript-eslint/no-explicit-any */
import { loadEnvLocal } from "../src/lib/env-local";

loadEnvLocal();
const espnS2 = process.env.ESPN_S2;
const rawSwid = process.env.SWID;
if (!espnS2 || !rawSwid) throw new Error("ESPN authentication is not configured");
const swid = rawSwid.startsWith("{") ? rawSwid : `{${rawSwid}}`;
const url = new URL("https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/segments/0/leagues/273644");
url.searchParams.set("scoringPeriodId", "16");
for (const view of ["mRoster", "mMatchupScore", "mBoxscore"]) url.searchParams.append("view", view);

async function main() {
  const response = await fetch(url, { headers: { accept: "application/json", cookie: `espn_s2=${espnS2}; SWID=${swid}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Week 16 QA request failed: HTTP ${response.status}`);
  const league = await response.json();
  const matchup = league.schedule?.find((item: any) => item.id === 113);
  const team = league.teams?.find((item: any) => item.id === 3);
  const starters = (team?.roster?.entries ?? []).filter((entry: any) => ![20, 21].includes(entry.lineupSlotId)).map((entry: any) => {
    const player = entry.playerPoolEntry?.player;
    const stat = player?.stats?.find((item: any) => item.scoringPeriodId === 16 && item.statSourceId === 0);
    return { player: player?.fullName ?? "Unknown", lineupSlotId: entry.lineupSlotId, appliedTotal: stat?.appliedTotal ?? null };
  });
  const supported = starters.every((entry: any) => typeof entry.appliedTotal === "number");
  const calculated = supported ? starters.reduce((total: number, entry: any) => total + entry.appliedTotal, 0) : null;
  console.info(JSON.stringify({ httpStatus: response.status, matchupId: matchup?.id ?? null, week: matchup?.matchupPeriodId ?? null, tier: matchup?.playoffTierType ?? null, completed: ["HOME", "AWAY", "TIE"].includes(matchup?.winner), espnTeamScore: matchup?.away?.teamId === 3 ? matchup.away.totalPoints : matchup?.home?.totalPoints, rosterEntriesReturned: team?.roster?.entries?.length ?? 0, starterStatsComplete: supported, calculatedStarterTotal: calculated === null ? null : Number(calculated.toFixed(2)), starters }));
}
void main();
