import type { EspnLeagueResponse } from "./types";

const BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

export class EspnClient {
  constructor(private readonly leagueId: number, private readonly cookies?: { espnS2: string; swid: string }) {}

  async fetchSeason(year: number): Promise<EspnLeagueResponse> {
    const url = new URL(`${BASE_URL}/${year}/segments/0/leagues/${this.leagueId}`);
    ["mTeam", "mRoster", "mMatchup", "mSettings", "mStatus"].forEach(view => url.searchParams.append("view", view));
    const headers: HeadersInit = { accept: "application/json" };
    if (this.cookies) headers.cookie = `espn_s2=${this.cookies.espnS2}; SWID=${this.cookies.swid}`;
    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) throw new Error(`ESPN request failed for ${year}: ${response.status} ${response.statusText}`);
    const data = await response.json() as EspnLeagueResponse;
    if (data.id !== this.leagueId) throw new Error(`ESPN returned unexpected league ${data.id}`);
    return data;
  }
}
