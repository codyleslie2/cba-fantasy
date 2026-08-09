import assert from "node:assert/strict";
import test from "node:test";
import review from "../data/generated/punishment-history-review.json";
import data from "../data/generated/cba-site-data.json";
import { derivePunishmentResult, PUNISHMENT_TIER, type PunishmentTeam } from "../src/lib/punishment-history";

const teams: PunishmentTeam[] = [
  { teamId: 1, managerId: "best", managerName: "Best Record", teamName: "Best", wins: 10, losses: 3, ties: 0, regularSeasonFinish: 1, finalStanding: 1 },
  { teamId: 2, managerId: "worst", managerName: "Worst Record", teamName: "Worst", wins: 2, losses: 11, ties: 0, regularSeasonFinish: 4, finalStanding: 2 },
  { teamId: 3, managerId: "punished", managerName: "Punished", teamName: "Punished Team", wins: 7, losses: 6, ties: 0, regularSeasonFinish: 2, finalStanding: 4 },
  { teamId: 4, managerId: "escaped", managerName: "Escaped", teamName: "Escaped Team", wins: 6, losses: 7, ties: 0, regularSeasonFinish: 3, finalStanding: 3 },
];

test("punishment loser follows the final bottom-place game rather than regular-season standings", () => {
  const result = derivePunishmentResult(2020, teams, [{ id: 9, week: 16, tier: PUNISHMENT_TIER, winner: "AWAY", homeTeamId: 3, awayTeamId: 4, homeScore: 80, awayScore: 90 }]);
  assert.equal(result.managerName, "Punished");
  assert.notEqual(result.managerName, "Worst Record");
  assert.equal(result.finalPunishmentMatchup?.matchupId, 9);
});

test("all completed seasons reconcile and inactive managers remain eligible", () => {
  assert.equal(review.results.length, 9);
  assert.equal(review.results.every((result) => result.confidence === "high"), true);
  assert.equal(review.results.find((result) => result.year === 2017)?.managerName, "Patrick Czechut");
  assert.equal(review.results.find((result) => result.year === 2018)?.managerName, "Brandon Hansen");
});

test("2018 and 2025 consolation anomalies stay in punishment data", () => {
  const game2018 = review.results.find((result) => result.year === 2018)?.bracketMatchups.find((game) => game.week === 14 && game.homeManagerName === "Brandon Hansen");
  const game2025 = review.results.find((result) => result.year === 2025)?.bracketMatchups.find((game) => game.week === 16 && game.awayManagerName === "Peter Ganz");
  assert.equal(game2018?.homeScore, 0);
  assert.equal(game2025?.awayScore, -1.1);
});

test("2026 receives no punishment result", () => {
  assert.equal(review.results.some((result) => result.year === 2026), false);
});

test("commissioner-approved Stupidest Loser history is canonical", () => {
  assert.deepEqual(Object.fromEntries(data.punishmentHistory.map((result) => [result.year, result.managerName])), {
    2017:"Patrick Czechut", 2018:"Brandon Hansen", 2019:"Alex Continenza", 2020:"Shawn Smith", 2021:"Cody Stalp", 2022:"Shawn Smith", 2023:"Jack Haley", 2024:"Shawn Smith", 2025:"Cody Leslie",
  });
  assert.equal(data.punishmentHistory.some((result) => result.year === 2026), false);
  assert.equal(data.punishmentHistory.every((result) => result.status === "approved"), true);
});

test("Shawn Smith owns three finishes and inactive managers retain theirs", () => {
  const manager = (name:string) => data.managers.find((row) => row.fullName === name)!;
  assert.equal(manager("Shawn Smith").punishmentFinishes, 3);
  assert.deepEqual(manager("Shawn Smith").punishmentSeasons, [2020, 2022, 2024]);
  assert.equal(manager("Patrick Czechut").status, "inactive");
  assert.equal(manager("Patrick Czechut").punishmentFinishes, 1);
  assert.equal(manager("Brandon Hansen").status, "inactive");
  assert.equal(manager("Brandon Hansen").punishmentFinishes, 1);
});

test("punishment statistics remain separate from championship playoff statistics", () => {
  const before = { regularWins:854, playoffWins:45 };
  assert.equal(data.managers.reduce((total, manager) => total + manager.wins, 0), before.regularWins);
  assert.equal(data.managers.reduce((total, manager) => total + manager.playoffWins, 0), before.playoffWins);
  assert.equal(data.managers.reduce((total, manager) => total + manager.punishmentBracketWins, 0), 108);
  assert.equal(data.managers.reduce((total, manager) => total + manager.punishmentBracketLosses, 0), 108);
});
