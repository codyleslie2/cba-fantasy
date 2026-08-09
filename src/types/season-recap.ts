export interface RecapGame { matchupId:number; week:number; homeManager:string; homeTeam:string; homeScore:number; awayManager:string; awayTeam:string; awayScore:number; winner:string; margin:number }
export interface RecapStanding { manager:string; teamName:string; teamId:number; wins:number; losses:number; ties:number; pointsFor:number; pointsAgainst:number; playoffResult:string; finalStanding:number|null }
export interface ScoreFact { manager:string; team:string; score:number; week:number }
export interface RecapSeasonFacts {
  year:number;
  champion:{manager:string;teamName:string;score:number};
  runnerUp:{manager:string;teamName:string;score:number};
  championshipWeek:number;
  standings:RecapStanding[];
  playoffs:RecapGame[];
  superlatives:{bestRecord:RecapStanding;mostPoints:RecapStanding;highestScore:ScoreFact;lowestEligibleScore:ScoreFact;biggestRegularSeasonBlowout:RecapGame;closestEligibleGame:RecapGame;longestWinningStreak:{manager:string;streak:number};highestScoringNonPlayoffTeam:RecapStanding|null;biggestPlayoffWin:RecapGame|null;closestPlayoffGame:RecapGame|null};
  numbers:{completedRegularSeasonGames:number;completedChampionshipBracketGames:number;totalEligibleCompletedGames:number;averageTeamScore:number;playoffTeams:number};
}
export interface RecapEditorial { review:string[]; championship:string; stupidestLoser:string; managerSummaries:Record<string,string> }
