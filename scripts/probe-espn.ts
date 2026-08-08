import { loadEnvLocal } from "../src/lib/env-local";
import { EspnClient, normalizeSeason } from "../src/lib/espn";

loadEnvLocal();
const leagueId = Number(process.env.ESPN_LEAGUE_ID ?? 273644);
const cookies = process.env.ESPN_S2 && process.env.SWID ? { espnS2: process.env.ESPN_S2, swid: process.env.SWID } : undefined;
if (!cookies) throw new Error("ESPN authentication is not configured in .env.local");

const client = new EspnClient(leagueId, cookies);
const initialYears = [2026, 2025, 2024];

async function probe(year: number) {
  const { data, attempt } = await client.probeSeason(year);
  if (!data) {
    console.info(JSON.stringify({ year, httpStatus: attempt.status, validEspnJson: false, teamsFound: null, completedMatchupsFound: null, ownerMemberDataAvailable: false, standingsAvailable: false, playoffDataAvailable: false }));
    return attempt.status;
  }
  const season = normalizeSeason(data);
  console.info(JSON.stringify({
    year, httpStatus: attempt.status, validEspnJson: true, teamsFound: season.teams.length,
    completedMatchupsFound: season.matchups.filter(m => m.completed).length,
    ownerMemberDataAvailable: season.members.length > 0 && season.teams.some(t => t.ownerIds.length > 0),
    standingsAvailable: season.teams.some(t => Boolean(t.record)),
    playoffDataAvailable: season.matchups.some(m => m.completed && m.isPlayoff),
  }));
  return attempt.status;
}

async function main() {
  const statuses: number[] = [];
  for (const year of initialYears) statuses.push(await probe(year));
  if (statuses.some(status => status === 401)) return;
  for (let year = 2023; year >= 2017; year -= 1) await probe(year);
}

void main();
