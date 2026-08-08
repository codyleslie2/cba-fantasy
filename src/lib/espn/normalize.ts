import type { EspnLeagueResponse, NormalizedEspnSeason } from "./types";

export function normalizeSeason(raw: EspnLeagueResponse): NormalizedEspnSeason {
  const members = (raw.members ?? []).map(member => ({
    espnMemberId: member.id,
    name: member.displayName || [member.firstName, member.lastName].filter(Boolean).join(" ") || `ESPN member ${member.id}`,
  }));
  const teams = (raw.teams ?? []).map(team => ({
    espnTeamId: team.id,
    ownerIds: team.owners ?? (team.primaryOwner ? [team.primaryOwner] : []),
    name: [team.location, team.nickname].filter(Boolean).join(" ").trim() || team.abbrev || `Team ${team.id}`,
  }));
  const matchups = (raw.schedule ?? []).flatMap(matchup => matchup.home && matchup.away ? [{
    espnMatchupId: matchup.id, week: matchup.matchupPeriodId, homeTeamId: matchup.home.teamId,
    awayTeamId: matchup.away.teamId, homeScore: matchup.home.totalPoints, awayScore: matchup.away.totalPoints,
    isPlayoff: Boolean(matchup.playoffTierType && matchup.playoffTierType !== "NONE"),
  }] : []);
  return { leagueId: raw.id, year: raw.seasonId, members, teams, matchups };
}
