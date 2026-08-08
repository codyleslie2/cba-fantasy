import raw from "../../data/generated/cba-site-data.json";
import type { CbaSiteData } from "@/types/cba-data";

export const cbaData = raw as unknown as CbaSiteData;
export const realManagers = cbaData.managers;
export const managerById = new Map(realManagers.map(manager => [manager.id, manager]));
export const managerBySlug = new Map(realManagers.map(manager => [manager.slug, manager]));
