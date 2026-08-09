import assert from "node:assert/strict";
import test from "node:test";
import { formatStatValue } from "../src/lib/format-stat";
import data from "../data/generated/cba-site-data.json";

test("season years never receive numeric grouping",()=>{
  assert.equal(formatStatValue(2017,"year"),"2017");
  assert.equal(formatStatValue(2025,"year"),"2025");
  assert.notEqual(formatStatValue(2017,"year"),"2,017");
  assert.notEqual(formatStatValue(2025,"year"),"2,025");
  const first=data.punishmentRecords.find(record=>record.label==="First-ever Stupidest Loser")!;
  const recent=data.punishmentRecords.find(record=>record.label==="Most recent Stupidest Loser")!;
  assert.equal(first.format,"year");
  assert.equal(recent.format,"year");
  assert.equal(formatStatValue(first.value,first.format),"2017");
  assert.equal(formatStatValue(recent.value,recent.format),"2025");
});

test("ordinary record-book values retain appropriate formatting",()=>{
  assert.equal(formatStatValue(12976.2,"decimal"),"12,976.20");
  assert.equal(formatStatValue(1642.64,"decimal"),"1,642.64");
  assert.equal(formatStatValue(14,"number"),"14");
  assert.equal(formatStatValue(4,"number"),"4");
});
