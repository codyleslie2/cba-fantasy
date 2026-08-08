import assert from "node:assert/strict";
import test from "node:test";
import site from "../data/generated/cba-site-data.json";
import facts from "../data/generated/season-recap-facts.json";
import editorial from "../data/season-recaps/editorial.json";
import managerSummaries from "../data/season-recaps/manager-summaries.json";

test("completed recap seasons are exactly 2017 through 2025",()=>{
  assert.deepEqual(facts.seasons.map(s=>s.year),[2017,2018,2019,2020,2021,2022,2023,2024,2025]);
  assert.equal(Object.hasOwn(editorial,"2026"),false);
});

test("every recap champion and final score reconcile to canonical site data",()=>{
  for(const season of facts.seasons){
    const championship=site.championships.find(c=>c.year===season.year)!;
    assert.equal(season.champion.manager,championship.championName);
    assert.equal(season.runnerUp.manager,championship.runnerUpName);
    assert.equal(season.champion.score,championship.championScore);
    assert.equal(season.runnerUp.score,championship.runnerUpScore);
    const final=season.playoffs.find(g=>g.week===season.championshipWeek&&g.winner===season.champion.manager);
    assert.ok(final,`${season.year} final is missing from recap facts`);
  }
});

test("every recap has editable long-form copy and complete participant summaries",()=>{
  for(const season of facts.seasons){
    const copy=editorial[String(season.year) as keyof typeof editorial];
    assert.ok(copy);
    assert.ok(copy.review.length>=3&&copy.review.length<=6);
    assert.ok(copy.review.every(paragraph=>paragraph.length>120));
    assert.ok(copy.championship.length>120);
    const summaries=managerSummaries[String(season.year) as keyof typeof managerSummaries];
    assert.deepEqual(Object.keys(summaries).sort(),season.standings.map(row=>row.manager).sort());
    assert.ok(Object.values(summaries).every(summary=>summary.length>80));
    for(const standing of season.standings){
      const summary=summaries[standing.manager as keyof typeof summaries];
      const record=`${standing.wins}-${standing.losses}${standing.ties?`-${standing.ties}`:""}`;
      const points=standing.pointsFor.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
      assert.ok(summary.includes(record),`${season.year} ${standing.manager} summary is missing ${record}`);
      assert.ok(summary.includes(points),`${season.year} ${standing.manager} summary is missing ${points}`);
    }
    assert.equal(new Set(season.standings.map(row=>row.manager)).size,season.standings.length);
    assert.ok(season.standings.length>=14);
  }
});

test("every manager-season summary is unique and free of retired templates",()=>{
  const summaries=Object.values(managerSummaries).flatMap(season=>Object.values(season));
  assert.equal(summaries.length,126);
  assert.equal(new Set(summaries).size,summaries.length);
  for(const retired of ["The playoff invitation was real","The standings have supplied all necessary commentary","Perfectly balanced, including the absence of a playoff run","Close enough to remember every decimal","This is the line everyone else was trying to avoid"]){
    assert.equal(summaries.some(summary=>summary.includes(retired)),false,`retired template remains: ${retired}`);
  }
});

test("recap superlatives are derived from eligible season games",()=>{
  for(const season of facts.seasons){
    const eligible=[...season.playoffs];
    assert.ok(season.superlatives.highestScore.score>=season.superlatives.lowestEligibleScore.score);
    assert.ok(season.superlatives.biggestRegularSeasonBlowout.margin>=season.superlatives.closestEligibleGame.margin);
    assert.equal(season.numbers.completedChampionshipBracketGames,eligible.length);
    assert.equal(season.numbers.totalEligibleCompletedGames,season.numbers.completedRegularSeasonGames+season.numbers.completedChampionshipBracketGames);
  }
});
