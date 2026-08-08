export interface EspnMember { id: string; displayName?: string; firstName?: string; lastName?: string }
export interface EspnTeam { id: number; owners?: string[]; primaryOwner?: string; location?: string; nickname?: string; abbrev?: string }
export interface EspnScheduleEntry { id: number; matchupPeriodId: number; home?: EspnCompetitor; away?: EspnCompetitor; winner?: "HOME" | "AWAY" | "UNDECIDED"; playoffTierType?: string }
export interface EspnCompetitor { teamId: number; totalPoints: number; cumulativeScore?: { scoreByStat?: Record<string, number> } }
export interface EspnLeagueResponse { id: number; seasonId: number; members?: EspnMember[]; teams?: EspnTeam[]; schedule?: EspnScheduleEntry[]; status?: { currentMatchupPeriod?: number; isActive?: boolean } }

export interface NormalizedEspnSeason {
  leagueId: number;
  year: number;
  members: Array<{ espnMemberId: string; name: string }>;
  teams: Array<{ espnTeamId: number; ownerIds: string[]; name: string }>;
  matchups: Array<{ espnMatchupId: number; week: number; homeTeamId: number; awayTeamId: number; homeScore: number; awayScore: number; isPlayoff: boolean }>;
}
