export type ManagerStatus = "active" | "inactive";

export interface Manager {
  id: string;
  slug: string;
  fullName: string;
  displayName: string;
  status: ManagerStatus;
  firstSeason?: number;
  lastSeason?: number;
  espnMemberId?: string;
  aliases: string[];
}

export interface Season { id: string; year: number; name: string; isComplete: boolean }

export interface FranchiseSeason {
  id: string;
  seasonId: string;
  espnTeamId: number;
  teamName: string;
}

export interface ManagerSeason {
  managerId: string;
  franchiseSeasonId: string;
  seasonId: string;
  role: "primary" | "co_owner";
}

export interface CareerRecord {
  managerId: string;
  seasons: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffAppearances: number;
  playoffWins: number;
  playoffLosses: number;
  finalsAppearances: number;
  championships: number;
  lastChampionship?: number;
  bestSeason?: string;
  worstSeason?: string;
}

export interface Matchup {
  id: string;
  seasonId: string;
  week: number;
  homeFranchiseSeasonId: string;
  awayFranchiseSeasonId: string;
  homeScore: number;
  awayScore: number;
  isPlayoff: boolean;
  source: "espn" | "manual";
}

export interface Championship { id: string; seasonId: string; managerId: string; year: number }

export interface Recap {
  id: string;
  seasonId: string;
  week: number;
  title: string;
  bodyMarkdown: string;
  publishedAt?: string;
}
