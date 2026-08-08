import identities from "../../../data/manager-identities.json";
import { matchManagerIdentity } from "./identity";
import type { NormalizedEspnSeason } from "./types";

export interface IdentityReviewRow {
  season: number; espnTeamId: number; teamName: string; espnOwnerIds: string[]; rawOwnerNames: string[];
  proposedManagerId: string | null; proposedDisplayName: string | null;
  confidence: "exact_id" | "exact_alias" | "unmatched" | "ambiguous";
  classification: "active" | "graveyard_candidate" | "ambiguous"; notes: string[];
}

export interface SeasonAudit {
  year: number; access: "success"; teamsFound: number; completedMatchups: number; regularSeasonMatchups: number;
  playoffMatchups: number; ownerInfoAvailable: boolean; standingsAvailable: boolean; playoffInfoAvailable: boolean;
  regularSeasonRecords: Array<{ teamName: string; wins: number; losses: number; ties: number; pointsFor: number; pointsAgainst: number }>;
  playoffResults: Array<{ week: number; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; winner: string | null }>;
  proposedChampion: string | null; championTeamId: number | null; notes: string[];
}

export interface ProvisionalManagerStats {
  identityKey: string; displayName: string; classification: "active" | "graveyard_candidate";
  wins: number; losses: number; ties: number; winPercentage: number; pointsFor: number; pointsAgainst: number;
  playoffAppearances: number; playoffWins: number; playoffLosses: number; finalsAppearances: number; championships: number;
}

const fallbackKey = (id: string) => `historical:${id}`;

export function reviewIdentities(seasons: NormalizedEspnSeason[]): IdentityReviewRow[] {
  return seasons.flatMap(season => {
    const memberNames = new Map(season.members.map(member => [member.espnMemberId, member.name]));
    return season.teams.map(team => {
      const rawOwnerNames = team.ownerIds.map(id => memberNames.get(id)).filter((name): name is string => Boolean(name));
      const matches = team.ownerIds.map((id, index) => matchManagerIdentity(id, rawOwnerNames[index] ?? ""));
      const uniqueMatches = [...new Map(matches.filter(m => m.manager).map(m => [m.manager!.id, m])).values()];
      const ambiguous = team.ownerIds.length !== 1 || rawOwnerNames.length !== team.ownerIds.length || uniqueMatches.length > 1;
      const match = !ambiguous && matches[0]?.manager ? matches[0] : null;
      const notes: string[] = [];
      if (team.ownerIds.length === 0) notes.push("No ESPN owner identifier on team");
      if (team.ownerIds.length > 1) notes.push("Multiple owner identifiers; commissioner review required");
      if (rawOwnerNames.length !== team.ownerIds.length) notes.push("One or more ESPN member records are missing");
      if (!match && !ambiguous) notes.push("No high-confidence active-manager match");
      return {
        season: season.year, espnTeamId: team.espnTeamId, teamName: team.name, espnOwnerIds: team.ownerIds,
        rawOwnerNames, proposedManagerId: match?.manager?.id ?? null, proposedDisplayName: match?.manager?.displayName ?? null,
        confidence: ambiguous ? "ambiguous" : match?.confidence ?? "unmatched",
        classification: ambiguous ? "ambiguous" : match ? "active" : "graveyard_candidate", notes,
      };
    });
  });
}

export function auditSeason(season: NormalizedEspnSeason): SeasonAudit {
  const names = new Map(season.teams.map(team => [team.espnTeamId, team.name]));
  const completed = season.matchups.filter(m => m.completed);
  const playoff = completed.filter(m => m.isPlayoff);
  const champion = season.teams.find(team => team.finalStanding === 1);
  const hasCompletedPlayoffs = playoff.length > 0;
  const proposedChampion = champion && hasCompletedPlayoffs ? champion : undefined;
  const notes: string[] = [];
  if (!proposedChampion) notes.push("Champion not determinable from a final standing plus completed playoff data");
  if (!season.members.length) notes.push("ESPN member collection unavailable");
  return {
    year: season.year, access: "success", teamsFound: season.teams.length, completedMatchups: completed.length,
    regularSeasonMatchups: completed.filter(m => !m.isPlayoff).length, playoffMatchups: playoff.length,
    ownerInfoAvailable: season.members.length > 0 && season.teams.some(t => t.ownerIds.length > 0),
    standingsAvailable: season.teams.some(t => Boolean(t.record)), playoffInfoAvailable: playoff.length > 0,
    regularSeasonRecords: season.teams.filter(t => t.record).map(t => ({ teamName: t.name, wins: t.record!.wins, losses: t.record!.losses, ties: t.record!.ties, pointsFor: t.record!.pointsFor, pointsAgainst: t.record!.pointsAgainst })),
    playoffResults: playoff.map(m => ({ week: m.week, homeTeam: names.get(m.homeTeamId) ?? String(m.homeTeamId), awayTeam: names.get(m.awayTeamId) ?? String(m.awayTeamId), homeScore: m.homeScore, awayScore: m.awayScore, winner: m.winnerTeamId ? names.get(m.winnerTeamId) ?? String(m.winnerTeamId) : null })),
    proposedChampion: proposedChampion?.name ?? null, championTeamId: proposedChampion?.espnTeamId ?? null, notes,
  };
}

function identityKey(row: IdentityReviewRow): { key: string; name: string; classification: "active" | "graveyard_candidate" } | null {
  if (row.classification === "ambiguous" || row.espnOwnerIds.length !== 1) return null;
  if (row.proposedManagerId) return { key: row.proposedManagerId, name: row.proposedDisplayName!, classification: "active" };
  return { key: fallbackKey(row.espnOwnerIds[0]), name: row.rawOwnerNames[0] ?? `ESPN member ${row.espnOwnerIds[0]}`, classification: "graveyard_candidate" };
}

export function calculateProvisionalStats(seasons: NormalizedEspnSeason[], reviews: IdentityReviewRow[]) {
  const stats = new Map<string, ProvisionalManagerStats & { playoffSeasons: Set<number>; finalsSeasons: Set<number>; championshipSeasons: Set<number> }>();
  const h2h = new Map<string, { manager: string; opponent: string; wins: number; losses: number; ties: number }>();
  const ensure = (identity: NonNullable<ReturnType<typeof identityKey>>) => {
    let value = stats.get(identity.key);
    if (!value) { value = { identityKey: identity.key, displayName: identity.name, classification: identity.classification, wins: 0, losses: 0, ties: 0, winPercentage: 0, pointsFor: 0, pointsAgainst: 0, playoffAppearances: 0, playoffWins: 0, playoffLosses: 0, finalsAppearances: 0, championships: 0, playoffSeasons: new Set(), finalsSeasons: new Set(), championshipSeasons: new Set() }; stats.set(identity.key, value); }
    return value;
  };
  for (const season of seasons) {
    const rows = reviews.filter(row => row.season === season.year);
    const identities = new Map(rows.map(row => [row.espnTeamId, identityKey(row)]));
    const hasCompletedPlayoffs = season.matchups.some(matchup => matchup.completed && matchup.isPlayoff);
    for (const team of season.teams) {
      const identity = identities.get(team.espnTeamId); if (!identity) continue;
      const value = ensure(identity);
      if (hasCompletedPlayoffs && team.finalStanding === 1) value.championshipSeasons.add(season.year);
      if (hasCompletedPlayoffs && (team.finalStanding === 1 || team.finalStanding === 2)) value.finalsSeasons.add(season.year);
    }
    for (const matchup of season.matchups.filter(m => m.completed)) {
      const homeIdentity = identities.get(matchup.homeTeamId); const awayIdentity = identities.get(matchup.awayTeamId);
      if (!homeIdentity || !awayIdentity || homeIdentity.key === awayIdentity.key) continue;
      const home = ensure(homeIdentity); const away = ensure(awayIdentity);
      if (matchup.isPlayoff) { home.playoffSeasons.add(season.year); away.playoffSeasons.add(season.year); }
      const homeWon = matchup.homeScore > matchup.awayScore; const awayWon = matchup.awayScore > matchup.homeScore;
      if (matchup.isPlayoff) {
        if (homeWon) { home.playoffWins++; away.playoffLosses++; }
        else if (awayWon) { away.playoffWins++; home.playoffLosses++; }
      } else {
        home.pointsFor += matchup.homeScore; home.pointsAgainst += matchup.awayScore; away.pointsFor += matchup.awayScore; away.pointsAgainst += matchup.homeScore;
        if (homeWon) { home.wins++; away.losses++; }
        else if (awayWon) { away.wins++; home.losses++; }
        else { home.ties++; away.ties++; }
      }
      for (const [manager, opponent, won, lost] of [[homeIdentity.key, awayIdentity.key, homeWon, awayWon], [awayIdentity.key, homeIdentity.key, awayWon, homeWon]] as const) {
        const key = `${manager}|${opponent}`; const value = h2h.get(key) ?? { manager, opponent, wins: 0, losses: 0, ties: 0 };
        if (won) value.wins++; else if (lost) value.losses++; else value.ties++; h2h.set(key, value);
      }
    }
  }
  const cleanStats = [...stats.values()].map(value => ({ ...value, winPercentage: (value.wins + value.losses + value.ties) ? value.wins / (value.wins + value.losses + value.ties) : 0, playoffAppearances: value.playoffSeasons.size, finalsAppearances: value.finalsSeasons.size, championships: value.championshipSeasons.size, playoffSeasons: undefined, finalsSeasons: undefined, championshipSeasons: undefined }));
  return { managers: cleanStats, headToHead: [...h2h.values()] };
}

export function historicalCandidates(reviews: IdentityReviewRow[]) {
  const groups = new Map<string, { espnOwnerId: string; names: Set<string>; seasons: Set<number>; teamNames: Set<string>; ambiguous: boolean }>();
  for (const row of reviews.filter(r => r.classification !== "active")) for (const [index, id] of row.espnOwnerIds.entries()) {
    const group = groups.get(id) ?? { espnOwnerId: id, names: new Set(), seasons: new Set(), teamNames: new Set(), ambiguous: false };
    if (row.rawOwnerNames[index]) group.names.add(row.rawOwnerNames[index]); group.seasons.add(row.season); group.teamNames.add(row.teamName); group.ambiguous ||= row.classification === "ambiguous"; groups.set(id, group);
  }
  return [...groups.values()].map(g => ({ espnOwnerId: g.espnOwnerId, rawNames: [...g.names], seasons: [...g.seasons].sort(), teamNames: [...g.teamNames], classification: "graveyard_candidate" as const, ambiguous: g.ambiguous }));
}

export const currentActiveManagerCount = identities.managers.filter(manager => manager.status === "active").length;
