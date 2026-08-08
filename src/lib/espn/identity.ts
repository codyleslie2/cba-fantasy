import identities from "../../../data/manager-identities.json";
import type { Manager } from "@/types/domain";

export interface IdentityMatch { manager: Manager | null; confidence: "exact_id" | "exact_alias" | "unmatched"; sourceName: string }
const approvedManagers: Manager[] = identities.managers.map(manager => ({ id: manager.id, slug: manager.slug, fullName: manager.fullName, displayName: manager.fullName, status: manager.status as Manager["status"], aliases: manager.espnAliases }));
const clean = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
export function matchManagerIdentity(espnMemberId:string,sourceName:string,managers:Manager[]=approvedManagers):IdentityMatch{const byId=managers.find(m=>m.espnMemberId===espnMemberId);if(byId)return{manager:byId,confidence:"exact_id",sourceName};const normalized=clean(sourceName);const byAlias=managers.find(m=>[m.fullName,m.displayName,...m.aliases].some(alias=>clean(alias)===normalized));return{manager:byAlias??null,confidence:byAlias?"exact_alias":"unmatched",sourceName}}
export function identityReport(memberId:string,name:string){const match=matchManagerIdentity(memberId,name);return{...match,action:match.manager?"link_existing_manager":"create_inactive_manager_for_review"}as const}
