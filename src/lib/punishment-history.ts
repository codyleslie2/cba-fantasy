export const PUNISHMENT_TIER = "LOSERS_CONSOLATION_LADDER";

export interface PunishmentTeam {
  teamId: number;
  managerId: string;
  managerName: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  regularSeasonFinish: number | null;
  finalStanding: number | null;
}

export interface PunishmentMatchupInput {
  id: number;
  week: number;
  tier: string;
  winner: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
}

export interface PunishmentMatchup {
  matchupId: number;
  week: number;
  managerName: string;
  teamName: string;
  score: number;
  opponentId: string;
  opponentName: string;
  opponentTeamName: string;
  opponentScore: number;
  result: "W" | "L" | "T";
}

export interface PunishmentBracketMatchup {
  matchupId: number;
  week: number;
  homeManagerName: string;
  homeTeamName: string;
  homeScore: number;
  awayManagerName: string;
  awayTeamName: string;
  awayScore: number;
  winnerName: string | "Tie";
}

export interface PunishmentResult {
  year: number;
  status: "commissioner_review" | "undetermined";
  confidence: "high" | "low";
  managerId: string | null;
  managerName: string | null;
  teamName: string | null;
  regularSeasonRecord: { wins: number; losses: number; ties: number } | null;
  regularSeasonFinish: number | null;
  consolationWins: number;
  consolationLosses: number;
  consolationTies: number;
  consolationMatchups: PunishmentMatchup[];
  bracketMatchups: PunishmentBracketMatchup[];
  finalPunishmentMatchup: PunishmentMatchup | null;
  finalOpponentId: string | null;
  finalOpponentName: string | null;
  finalScore: number | null;
  opponentScore: number | null;
  entrants: string[];
  actualPunishment: string;
  punishmentNotes: string;
  notes: string[];
}

const completed = new Set(["HOME", "AWAY", "TIE"]);

export function derivePunishmentResult(
  year: number,
  teams: PunishmentTeam[],
  schedule: PunishmentMatchupInput[],
): PunishmentResult {
  const teamById = new Map(teams.map((team) => [team.teamId, team]));
  const games = schedule
    .filter((game) => game.tier === PUNISHMENT_TIER && completed.has(game.winner))
    .sort((a, b) => a.week - b.week || a.id - b.id);
  const entrants = [...new Set(games.flatMap((game) => [game.homeTeamId, game.awayTeamId]))]
    .map((teamId) => teamById.get(teamId)?.managerName)
    .filter((name): name is string => Boolean(name))
    .sort();
  const ranked = teams
    .filter((team) => team.finalStanding !== null)
    .sort((a, b) => (b.finalStanding ?? 0) - (a.finalStanding ?? 0));
  const bottom = ranked[0];
  const nextToBottom = ranked[1];
  const lastWeek = games.at(-1)?.week;
  const finalCandidates = games.filter(
    (game) =>
      game.week === lastWeek &&
      bottom &&
      nextToBottom &&
      [game.homeTeamId, game.awayTeamId].includes(bottom.teamId) &&
      [game.homeTeamId, game.awayTeamId].includes(nextToBottom.teamId),
  );
  const finalGame = finalCandidates.length === 1 ? finalCandidates[0] : null;
  const bottomLostFinal = finalGame ? resultFor(finalGame, bottom.teamId) === "L" : false;
  const finalRanksConsecutive = Boolean(
    bottom && nextToBottom && bottom.finalStanding === teams.length && nextToBottom.finalStanding === teams.length - 1,
  );
  const confident = Boolean(bottom?.managerId && finalGame && bottomLostFinal && finalRanksConsecutive);
  const path = bottom ? games.filter((game) => [game.homeTeamId, game.awayTeamId].includes(bottom.teamId)).map((game) => packGame(game, bottom.teamId, teamById)) : [];
  const notes: string[] = [];
  if (!finalRanksConsecutive) notes.push("ESPN final positions do not identify a consecutive bottom-two pair.");
  if (!finalGame) notes.push("No unique final-week bottom-two placement matchup was found.");
  if (finalGame && !bottomLostFinal) notes.push("ESPN's bottom finisher did not lose the proposed final punishment matchup.");
  if (path.some((game) => game.result === "W")) notes.push("Placement-ladder structure: the bottom finisher won an earlier consolation matchup before losing the final punishment matchup.");
  if (games.length && new Set(games.map((game) => game.week)).size !== 3) notes.push("The punishment ladder does not span the usual three matchup periods.");

  return {
    year,
    status: confident ? "commissioner_review" : "undetermined",
    confidence: confident ? "high" : "low",
    managerId: confident ? bottom.managerId : null,
    managerName: confident ? bottom.managerName : null,
    teamName: confident ? bottom.teamName : null,
    regularSeasonRecord: confident ? { wins: bottom.wins, losses: bottom.losses, ties: bottom.ties } : null,
    regularSeasonFinish: confident ? bottom.regularSeasonFinish : null,
    consolationWins: path.filter((game) => game.result === "W").length,
    consolationLosses: path.filter((game) => game.result === "L").length,
    consolationTies: path.filter((game) => game.result === "T").length,
    consolationMatchups: path,
    bracketMatchups: games.map((game) => {
      const home = teamById.get(game.homeTeamId)!;
      const away = teamById.get(game.awayTeamId)!;
      return { matchupId: game.id, week: game.week, homeManagerName: home.managerName, homeTeamName: home.teamName, homeScore: game.homeScore, awayManagerName: away.managerName, awayTeamName: away.teamName, awayScore: game.awayScore, winnerName: game.winner === "HOME" ? home.managerName : game.winner === "AWAY" ? away.managerName : "Tie" };
    }),
    finalPunishmentMatchup: confident && finalGame ? packGame(finalGame, bottom.teamId, teamById) : null,
    finalOpponentId: confident && finalGame ? opponentFor(finalGame, bottom.teamId, teamById)?.managerId ?? null : null,
    finalOpponentName: confident && finalGame ? opponentFor(finalGame, bottom.teamId, teamById)?.managerName ?? null : null,
    finalScore: confident && finalGame ? scoreFor(finalGame, bottom.teamId) : null,
    opponentScore: confident && finalGame ? opponentScoreFor(finalGame, bottom.teamId) : null,
    entrants,
    actualPunishment: "",
    punishmentNotes: "",
    notes,
  };
}

function packGame(game: PunishmentMatchupInput, teamId: number, teams: Map<number, PunishmentTeam>): PunishmentMatchup {
  const team = teams.get(teamId)!;
  const opponent = opponentFor(game, teamId, teams)!;
  return { matchupId: game.id, week: game.week, managerName: team.managerName, teamName: team.teamName, score: scoreFor(game, teamId), opponentId: opponent.managerId, opponentName: opponent.managerName, opponentTeamName: opponent.teamName, opponentScore: opponentScoreFor(game, teamId), result: resultFor(game, teamId) };
}

function opponentFor(game: PunishmentMatchupInput, teamId: number, teams: Map<number, PunishmentTeam>) {
  return teams.get(game.homeTeamId === teamId ? game.awayTeamId : game.homeTeamId);
}

function scoreFor(game: PunishmentMatchupInput, teamId: number) {
  return game.homeTeamId === teamId ? game.homeScore : game.awayScore;
}

function opponentScoreFor(game: PunishmentMatchupInput, teamId: number) {
  return game.homeTeamId === teamId ? game.awayScore : game.homeScore;
}

function resultFor(game: PunishmentMatchupInput, teamId: number): "W" | "L" | "T" {
  if (game.winner === "TIE") return "T";
  const won = (game.winner === "HOME" && game.homeTeamId === teamId) || (game.winner === "AWAY" && game.awayTeamId === teamId);
  return won ? "W" : "L";
}
