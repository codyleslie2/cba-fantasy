import { EspnAccessError, type EspnAccessAttempt, type EspnLeagueResponse } from "./types";

const BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

export class EspnClient {
  constructor(private readonly leagueId: number, private readonly cookies?: { espnS2: string; swid: string }) {}

  /** Single modern API request used for authentication probes. No endpoint fallback. */
  async probeSeason(year: number): Promise<{ data: EspnLeagueResponse | null; attempt: EspnAccessAttempt }> {
    const attempts: EspnAccessAttempt[] = [];
    const url = new URL(`${BASE_URL}/${year}/segments/0/leagues/${this.leagueId}`);
    this.addViews(url);
    const response = await this.request(url, "season", attempts);
    return { data: response ? this.assertLeague(Array.isArray(response) ? response[0] : response, year) : null, attempt: attempts[0] };
  }

  async fetchSeason(year: number): Promise<EspnLeagueResponse> {
    const attempts: EspnAccessAttempt[] = [];
    const currentUrl = new URL(`${BASE_URL}/${year}/segments/0/leagues/${this.leagueId}`);
    this.addViews(currentUrl);
    const current = await this.request(currentUrl, "season", attempts);
    if (current) return this.assertLeague(Array.isArray(current) ? current[0] : current, year);

    const alternateUrl = new URL(`https://fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${this.leagueId}`);
    this.addViews(alternateUrl);
    const alternate = await this.request(alternateUrl, "season", attempts);
    if (alternate) return this.assertLeague(Array.isArray(alternate) ? alternate[0] : alternate, year);

    // ESPN stores pre-2018 leagues behind the legacy v3 leagueHistory route.
    const legacyUrl = new URL(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${this.leagueId}`);
    legacyUrl.searchParams.set("seasonId", String(year));
    this.addViews(legacyUrl);
    const legacy = await this.request(legacyUrl, "leagueHistory", attempts);
    if (legacy) {
      const unwrapped = Array.isArray(legacy) ? legacy[0] : legacy;
      return this.assertLeague(unwrapped, year);
    }
    const alternateLegacyUrl = new URL(`https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${this.leagueId}`);
    alternateLegacyUrl.searchParams.set("seasonId", String(year));
    this.addViews(alternateLegacyUrl);
    const alternateLegacy = await this.request(alternateLegacyUrl, "leagueHistory", attempts);
    if (alternateLegacy) return this.assertLeague(Array.isArray(alternateLegacy) ? alternateLegacy[0] : alternateLegacy, year);
    if (year <= 2017) await this.probeLegacyV2(year, attempts);
    throw new EspnAccessError(year, attempts);
  }

  private addViews(url: URL) {
    ["mTeam", "mRoster", "mMatchup", "mMatchupScore", "mSettings", "mStatus"].forEach(view => url.searchParams.append("view", view));
  }

  private async request(url: URL, endpoint: "season" | "leagueHistory", attempts: EspnAccessAttempt[]): Promise<EspnLeagueResponse | EspnLeagueResponse[] | null> {
    const headers: HeadersInit = { accept: "application/json" };
    if (this.cookies) {
      const swid = this.cookies.swid.startsWith("{") ? this.cookies.swid : `{${this.cookies.swid}}`;
      headers.cookie = `espn_s2=${this.cookies.espnS2}; SWID=${swid}`;
    }
    const response = await fetch(url, { headers, cache: "no-store" });
    const attempt = { endpoint, url: this.redactUrl(url), status: response.status, statusText: response.statusText } satisfies EspnAccessAttempt;
    attempts.push(attempt);
    if (!response.ok) return null;
    try {
      return await response.json() as EspnLeagueResponse | EspnLeagueResponse[];
    } catch {
      attempt.statusText = "Non-JSON response";
      return null;
    }
  }

  private async probeLegacyV2(year: number, attempts: EspnAccessAttempt[]) {
    for (const [route, endpoint] of [["leagueSettings", "legacyV2Settings"], ["standings", "legacyV2Standings"]] as const) {
      const url = new URL(`https://games.espn.com/ffl/api/v2/${route}`);
      url.searchParams.set("leagueId", String(this.leagueId)); url.searchParams.set("seasonId", String(year));
      const headers: HeadersInit = { accept: "application/json" };
      if (this.cookies) {
        const swid = this.cookies.swid.startsWith("{") ? this.cookies.swid : `{${this.cookies.swid}}`;
        headers.cookie = `espn_s2=${this.cookies.espnS2}; SWID=${swid}`;
      }
      const response = await fetch(url, { headers, redirect: "manual", cache: "no-store" });
      attempts.push({ endpoint, url: this.redactUrl(url), status: response.status, statusText: response.statusText || "No status text" });
    }
  }

  private assertLeague(data: EspnLeagueResponse, year: number) {
    if (!data || data.id !== this.leagueId) throw new Error(`ESPN returned unexpected league payload for ${year}`);
    return data;
  }

  private redactUrl(url: URL) { return `${url.origin}${url.pathname}?season=${url.searchParams.get("seasonId") ?? "path"}`; }
}
