import { activeManagers, demoInactiveManagers } from "./managers";
import type { CareerRecord, Championship } from "@/types/domain";

/** DEMO-ONLY layout data. None of these statistics are historical CBA claims. */
export const demoCareerRecords: CareerRecord[] = [...activeManagers, ...demoInactiveManagers].map((manager, index) => ({
  managerId: manager.id,
  seasons: 9 - (index % 3),
  wins: 82 - index * 2,
  losses: 51 + index * 2,
  ties: index % 5 === 0 ? 1 : 0,
  pointsFor: 18420 - index * 211,
  pointsAgainst: 17780 - index * 163,
  playoffAppearances: Math.max(1, 7 - (index % 6)),
  playoffWins: Math.max(0, 8 - (index % 8)),
  playoffLosses: 3 + (index % 4),
  finalsAppearances: index % 4,
  championships: index % 5 === 0 ? 2 : index % 4 === 0 ? 1 : 0,
  lastChampionship: index % 4 === 0 ? 2024 - index : undefined,
  bestSeason: `${11 - (index % 3)}-${3 + (index % 3)}`,
  worstSeason: `${4 + (index % 3)}-${10 - (index % 3)}`,
}));

export const demoChampionships: Championship[] = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((year, index) => ({
  id: `demo-champ-${year}`, seasonId: `season-${year}`, managerId: activeManagers[index % activeManagers.length].id, year,
}));

export const managerById = new Map([...activeManagers, ...demoInactiveManagers].map((m) => [m.id, m]));

export const demoStandings = activeManagers.slice(0, 8).map((manager, index) => ({ manager, wins: 8 - Math.floor(index / 2), losses: 3 + Math.floor(index / 2), points: 1482 - index * 37 }));

export function demoH2H(row: number, col: number) {
  if (row === col) return null;
  const games = 6 + ((row + col) % 7);
  const wins = Math.min(games, 2 + ((row * 3 + col) % 8));
  return { wins, losses: games - wins };
}
