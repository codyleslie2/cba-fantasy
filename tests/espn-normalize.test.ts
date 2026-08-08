import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSeason } from "../src/lib/espn/normalize";
import { auditSeason, calculateProvisionalStats, reviewIdentities } from "../src/lib/espn/analyze";
import type { EspnLeagueResponse } from "../src/lib/espn/types";

const fixture: EspnLeagueResponse = {
  id: 273644, seasonId: 2024,
  members: [{ id: "m1", firstName: "Cody", lastName: "Leslie" }, { id: "old", displayName: "Historical Person" }],
  teams: [
    { id: 1, owners: ["m1"], location: "Test", nickname: "One", rankCalculatedFinal: 1, record: { overall: { wins: 1, losses: 0, ties: 0, pointsFor: 110, pointsAgainst: 90 } } },
    { id: 2, owners: ["old"], location: "Test", nickname: "Two", rankCalculatedFinal: 2, record: { overall: { wins: 0, losses: 1, ties: 0, pointsFor: 90, pointsAgainst: 110 } } },
  ],
  settings: { scheduleSettings: { matchupPeriodCount: 1 } },
  schedule: [
    { id: 1, matchupPeriodId: 1, winner: "HOME", home: { teamId: 1, totalPoints: 110 }, away: { teamId: 2, totalPoints: 90 } },
    { id: 2, matchupPeriodId: 2, playoffTierType: "WINNERS_BRACKET", winner: "HOME", home: { teamId: 1, totalPoints: 120 }, away: { teamId: 2, totalPoints: 100 } },
  ], status: { isActive: false },
};

test("normalizes standings, regular season, and playoffs", () => {
  const season = normalizeSeason(fixture);
  assert.equal(season.teams[0].name, "Test One");
  assert.equal(season.matchups.filter(m => m.isPlayoff).length, 1);
  assert.equal(auditSeason(season).proposedChampion, "Test One");
});

test("matches exact active identity and preserves unmatched history", () => {
  const rows = reviewIdentities([normalizeSeason(fixture)]);
  assert.equal(rows[0].proposedDisplayName, "Cody Leslie");
  assert.equal(rows[0].confidence, "exact_alias");
  assert.equal(rows[1].classification, "graveyard_candidate");
});

test("calculates provisional W-L and H2H without merging unmatched identity", () => {
  const season = normalizeSeason(fixture); const rows = reviewIdentities([season]);
  const result = calculateProvisionalStats([season], rows);
  const leslie = result.managers.find(m => m.displayName === "Cody Leslie");
  assert.equal(leslie?.wins, 1);
  assert.equal(leslie?.playoffWins, 1);
  assert.equal(result.headToHead.length, 2);
});
