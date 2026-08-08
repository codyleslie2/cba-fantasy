/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type RawGame = { id:number; matchupPeriodId:number; winner:string; playoffTierType?:string; home?:{teamId:number;totalPoints:number}; away?:{teamId:number;totalPoints:number} };
type FactGame = { matchupId:number; week:number; homeManager:string; homeTeam:string; homeScore:number; awayManager:string; awayTeam:string; awayScore:number; winner:string; margin:number };
const root=process.cwd(); const round=(n:number)=>Number(n.toFixed(2));

async function main(){
  const site=JSON.parse(await readFile(resolve(root,"data/generated/cba-site-data.json"),"utf8"));
  const seasons=[];
  for(let year=2017;year<=2025;year++){
    const raw=JSON.parse(await readFile(resolve(root,`data/raw/${year}.json`),"utf8"));
    const champ=site.championships.find((c:{year:number})=>c.year===year);
    const managerByTeam=new Map<number,string>();
    for(const manager of site.managers)for(const season of manager.seasonHistory)if(season.year===year)managerByTeam.set(season.espnTeamId,manager.fullName);
    const teamById=new Map<number,any>(raw.teams.map((t:any)=>[t.id,t]));
    const managerSeason=new Map(site.managers.flatMap((m:any)=>m.seasonHistory.filter((s:any)=>s.year===year).map((s:any)=>[m.fullName,{...s,status:m.status}])));
    const regular=(raw.schedule as RawGame[]).filter(g=>g.home&&g.away&&["HOME","AWAY","TIE"].includes(g.winner)&&(g.playoffTierType??"NONE")==="NONE").map(g=>packGame(g,teamById,managerByTeam));
    const playoffs=(raw.schedule as RawGame[]).filter(g=>g.home&&g.away&&["HOME","AWAY","TIE"].includes(g.winner)&&g.playoffTierType==="WINNERS_BRACKET").map(g=>packGame(g,teamById,managerByTeam)).sort((a,b)=>a.week-b.week||a.matchupId-b.matchupId);
    const playoffTeams=new Set(playoffs.flatMap(g=>[g.homeManager,g.awayManager]));
    const standings=[...teamById.values()].map((t:any)=>{const name=managerByTeam.get(t.id)??`Team ${t.id}`;const ms:any=managerSeason.get(name);const r=t.record?.overall??{};return{manager:name,teamName:t.name||t.abbrev,teamId:t.id,wins:r.wins??0,losses:r.losses??0,ties:r.ties??0,pointsFor:round(r.pointsFor??0),pointsAgainst:round(r.pointsAgainst??0),playoffResult:ms?.playoffResult??"Unknown",finalStanding:t.rankCalculatedFinal??null}}).sort((a,b)=>b.wins-a.wins||b.pointsFor-a.pointsFor);
    const eligible=[...regular,...playoffs]; const sides=eligible.flatMap(g=>[{manager:g.homeManager,team:g.homeTeam,score:g.homeScore,week:g.week},{manager:g.awayManager,team:g.awayTeam,score:g.awayScore,week:g.week}]);
    const regularMargins=regular.map(g=>({...g})); const playoffMargins=playoffs.map(g=>({...g}));
    const streaks=standings.map(s=>({manager:s.manager,streak:longestStreak(regular,s.manager)})).sort((a,b)=>b.streak-a.streak);
    const nonPlayoff=[...standings].filter(s=>!playoffTeams.has(s.manager)).sort((a,b)=>b.pointsFor-a.pointsFor)[0]??null;
    const highest=[...sides].sort((a,b)=>b.score-a.score)[0]; const lowest=[...sides].sort((a,b)=>a.score-b.score)[0];
    const biggest=[...regularMargins].sort((a,b)=>b.margin-a.margin)[0]; const closest=[...eligible].sort((a,b)=>a.margin-b.margin)[0];
    const biggestPo=[...playoffMargins].sort((a,b)=>b.margin-a.margin)[0]??null; const closestPo=[...playoffMargins].sort((a,b)=>a.margin-b.margin)[0]??null;
    seasons.push({year,champion:{manager:champ.championName,teamName:champ.championTeamName,score:champ.championScore},runnerUp:{manager:champ.runnerUpName,teamName:champ.runnerUpTeamName,score:champ.runnerUpScore},championshipWeek:champ.week,standings,playoffs,superlatives:{bestRecord:standings[0],mostPoints:[...standings].sort((a,b)=>b.pointsFor-a.pointsFor)[0],highestScore:highest,lowestEligibleScore:lowest,biggestRegularSeasonBlowout:biggest,closestEligibleGame:closest,longestWinningStreak:streaks[0],highestScoringNonPlayoffTeam:nonPlayoff,biggestPlayoffWin:biggestPo,closestPlayoffGame:closestPo},numbers:{completedRegularSeasonGames:regular.length,completedChampionshipBracketGames:playoffs.length,totalEligibleCompletedGames:eligible.length,averageTeamScore:round(sides.reduce((n,x)=>n+x.score,0)/sides.length),playoffTeams:playoffTeams.size}});
  }
  await mkdir(resolve(root,"data/generated"),{recursive:true});
  await writeFile(resolve(root,"data/generated/season-recap-facts.json"),JSON.stringify({generatedAt:new Date().toISOString(),seasons},null,2)+"\n");
  await writeFile(resolve(root,"data/season-recaps-audit.md"),renderAudit(seasons),"utf8");
  console.info(`Generated audited recap facts for ${seasons.length} completed seasons.`);
}

function packGame(g:RawGame,teams:Map<number,any>,managers:Map<number,string>):FactGame{const h=g.home!,a=g.away!;const hs=round(h.totalPoints),as=round(a.totalPoints);return{matchupId:g.id,week:g.matchupPeriodId,homeManager:managers.get(h.teamId)??`Team ${h.teamId}`,homeTeam:teams.get(h.teamId)?.name??`Team ${h.teamId}`,homeScore:hs,awayManager:managers.get(a.teamId)??`Team ${a.teamId}`,awayTeam:teams.get(a.teamId)?.name??`Team ${a.teamId}`,awayScore:as,winner:hs>as?(managers.get(h.teamId)??`Team ${h.teamId}`):as>hs?(managers.get(a.teamId)??`Team ${a.teamId}`):"Tie",margin:round(Math.abs(hs-as))}}
function longestStreak(games:FactGame[],manager:string){let current=0,max=0;for(const game of [...games].sort((a,b)=>a.week-b.week||a.matchupId-b.matchupId)){if(game.homeManager!==manager&&game.awayManager!==manager)continue;if(game.winner===manager){current++;max=Math.max(max,current)}else current=0}return max}
function gameLine(g:FactGame|null){return g?`Week ${g.week}: ${g.homeManager} (${g.homeTeam}) ${g.homeScore}–${g.awayScore} ${g.awayManager} (${g.awayTeam}); winner ${g.winner}, margin ${g.margin}`:"Not available"}
function renderAudit(seasons:any[]){const out=["# CBA Season Recaps Accuracy Audit","","> Generated only from completed ESPN matchups, normalized permanent manager identities, and commissioner-approved CBA statistics.",""];for(const s of seasons){out.push(`## ${s.year}`,"",`- **Champion:** ${s.champion.manager} (${s.champion.teamName})`,`- **Runner-up:** ${s.runnerUp.manager} (${s.runnerUp.teamName})`,`- **Championship:** ${s.champion.score}–${s.runnerUp.score} in Week ${s.championshipWeek}`,"","### Final regular-season standings","","| Manager | Team | W-L-T | PF | PA | Postseason |","|---|---|---:|---:|---:|---|",...s.standings.map((x:any)=>`| ${x.manager} | ${x.teamName} | ${x.wins}-${x.losses}-${x.ties} | ${x.pointsFor.toFixed(2)} | ${x.pointsAgainst.toFixed(2)} | ${x.playoffResult} |`),"","### Championship bracket","",...s.playoffs.map((g:FactGame)=>`- ${gameLine(g)}`),"","### Superlatives","",`- **Best record:** ${s.superlatives.bestRecord.manager}, ${s.superlatives.bestRecord.wins}-${s.superlatives.bestRecord.losses}-${s.superlatives.bestRecord.ties}`,`- **Most points:** ${s.superlatives.mostPoints.manager}, ${s.superlatives.mostPoints.pointsFor.toFixed(2)}`,`- **Highest score:** ${s.superlatives.highestScore.manager}, ${s.superlatives.highestScore.score.toFixed(2)} in Week ${s.superlatives.highestScore.week}`,`- **Lowest eligible score:** ${s.superlatives.lowestEligibleScore.manager}, ${s.superlatives.lowestEligibleScore.score.toFixed(2)} in Week ${s.superlatives.lowestEligibleScore.week}`,`- **Biggest regular-season blowout:** ${gameLine(s.superlatives.biggestRegularSeasonBlowout)}`,`- **Closest eligible game:** ${gameLine(s.superlatives.closestEligibleGame)}`,`- **Longest regular-season winning streak:** ${s.superlatives.longestWinningStreak.manager}, ${s.superlatives.longestWinningStreak.streak}`,`- **Biggest championship-bracket win:** ${gameLine(s.superlatives.biggestPlayoffWin)}`,`- **Closest championship-bracket game:** ${gameLine(s.superlatives.closestPlayoffGame)}`,"","### Season numbers","",`- Completed regular-season games: ${s.numbers.completedRegularSeasonGames}`,`- Completed championship-bracket games: ${s.numbers.completedChampionshipBracketGames}`,`- Average eligible team score: ${s.numbers.averageTeamScore.toFixed(2)}`,`- Championship-bracket teams: ${s.numbers.playoffTeams}`,"")};return out.join("\n")}
void main();
