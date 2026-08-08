import type { EspnLeagueResponse, NormalizedEspnSeason } from "./types";

export function normalizeSeason(raw: EspnLeagueResponse): NormalizedEspnSeason {
  const regularSeasonWeekCount = raw.settings?.scheduleSettings?.matchupPeriodCount;
  const members = (raw.members ?? []).map(member => ({
    espnMemberId: member.id,
    name: member.displayName || [member.firstName, member.lastName].filter(Boolean).join(" ") || `ESPN member ${member.id}`,
  }));
  const teams = (raw.teams ?? []).map(team => {
    const record = team.record?.overall;
    return {
    espnTeamId: team.id,
    ownerIds: team.owners ?? (team.primaryOwner ? [team.primaryOwner] : []),
    name: team.name || [team.location, team.nickname].filter(Boolean).join(" ").trim() || team.abbrev || `Team ${team.id}`,
    finalStanding: team.rankCalculatedFinal,
    playoffSeed: team.playoffSeed,
    record: record ? {
      wins: record.wins ?? 0, losses: record.losses ?? 0, ties: record.ties ?? 0,
      pointsFor: record.pointsFor ?? 0, pointsAgainst: record.pointsAgainst ?? 0, percentage: record.percentage ?? 0,
    } : undefined,
  }});
  const matchups = (raw.schedule ?? []).flatMap(matchup => matchup.home && matchup.away ? [{
    espnMatchupId: matchup.id, week: matchup.matchupPeriodId, homeTeamId: matchup.home.teamId,
    awayTeamId: matchup.away.teamId, homeScore: matchup.home.totalPoints, awayScore: matchup.away.totalPoints,
    isPlayoff: regularSeasonWeekCount ? matchup.matchupPeriodId > regularSeasonWeekCount : Boolean(matchup.playoffTierType && matchup.playoffTierType !== "NONE"),
    playoffTierType: matchup.playoffTierType,
    completed: matchup.winner === "HOME" || matchup.winner === "AWAY" || matchup.winner === "TIE",
    winnerTeamId: matchup.winner === "HOME" ? matchup.home.teamId : matchup.winner === "AWAY" ? matchup.away.teamId : undefined,
  }] : []);
  return { leagueId: raw.id, year: raw.seasonId, members, teams, matchups, regularSeasonWeekCount, active: raw.status?.isActive ?? false };
}
