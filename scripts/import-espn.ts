import { EspnClient, identityReport, normalizeSeason } from "../src/lib/espn";

const leagueId = Number(process.env.ESPN_LEAGUE_ID ?? 273644);
const startYear = Number(process.argv[2] ?? 2017);
const endYear = Number(process.argv[3] ?? new Date().getFullYear());
const cookies = process.env.ESPN_S2 && process.env.ESPN_SWID ? { espnS2: process.env.ESPN_S2, swid: process.env.ESPN_SWID } : undefined;

async function main() {
  console.info(`[CBA import preview] league=${leagueId}, seasons=${startYear}-${endYear}`);
  const client = new EspnClient(leagueId, cookies);
  for (let year = startYear; year <= endYear; year += 1) {
    try {
      const season = normalizeSeason(await client.fetchSeason(year));
      const identities = season.members.map(m => identityReport(m.espnMemberId, m.name));
      console.info(`[${year}] ${season.teams.length} teams, ${season.matchups.length} matchups, ${identities.filter(i => !i.manager).length} identities need review`);
    } catch (error) {
      console.error(`[${year}]`, error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }
  console.info("Preview complete. No database writes were performed.");
}
void main();
