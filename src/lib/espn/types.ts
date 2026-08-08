export interface EspnMember { id: string; displayName?: string; firstName?: string; lastName?: string }
export interface EspnRecord { wins?: number; losses?: number; ties?: number; pointsFor?: number; pointsAgainst?: number; percentage?: number }
export interface EspnTeam {
  id: number; owners?: string[]; primaryOwner?: string; name?: string; location?: string; nickname?: string; abbrev?: string;
  rankCalculatedFinal?: number; playoffSeed?: number; record?: { overall?: EspnRecord };
}
export interface EspnScheduleEntry { id: number; matchupPeriodId: number; home?: EspnCompetitor; away?: EspnCompetitor; winner?: "HOME" | "AWAY" | "TIE" | "UNDECIDED"; playoffTierType?: string }
export interface EspnCompetitor { teamId: number; totalPoints: number; cumulativeScore?: { scoreByStat?: Record<string, number> } }
export interface EspnLeagueResponse {
  id: number; seasonId: number; members?: EspnMember[]; teams?: EspnTeam[]; schedule?: EspnScheduleEntry[];
  status?: { currentMatchupPeriod?: number; isActive?: boolean; latestScoringPeriod?: number };
  settings?: { scheduleSettings?: { matchupPeriodCount?: number; playoffMatchupPeriodLength?: number; playoffSeedingRule?: string } };
}

export interface EspnAccessAttempt { endpoint: "season" | "leagueHistory" | "legacyV2Settings" | "legacyV2Standings"; url: string; status: number; statusText: string }
export class EspnAccessError extends Error {
  constructor(public readonly year: number, public readonly attempts: EspnAccessAttempt[]) {
    super(`ESPN access failed for ${year}: ${attempts.map(a => `${a.endpoint}=${a.status}`).join(", ")}`);
  }
}

export interface NormalizedEspnSeason {
  leagueId: number;
  year: number;
  members: Array<{ espnMemberId: string; name: string }>;
  teams: Array<{ espnTeamId: number; ownerIds: string[]; name: string; finalStanding?: number; playoffSeed?: number; record?: Required<EspnRecord> }>;
  matchups: Array<{ espnMatchupId: number; week: number; homeTeamId: number; awayTeamId: number; homeScore: number; awayScore: number; isPlayoff: boolean; playoffTierType?: string; completed: boolean; winnerTeamId?: number }>;
  regularSeasonWeekCount?: number;
  active: boolean;
}
