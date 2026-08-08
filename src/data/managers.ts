import type { Manager } from "@/types/domain";

export const activeManagers: Manager[] = [
  ["kelbey-heider", "Kelbey Heider", "Heider"], ["will-leafstedt", "Will Leafstedt", "Leafstedt"],
  ["peter-ganz", "Peter Ganz", "Ganz"], ["cody-stalp", "Cody Stalp", "Stalp"],
  ["wes-dempsey", "Wes Dempsey", "Dempsey"], ["jason-nitz", "Jason Nitz", "Nitz"],
  ["alex-continenza", "Alex Continenza", "Continenza"], ["jawad-najdawi", "Jawad Najdawi", "Najdawi"],
  ["cody-leslie", "Cody Leslie", "Leslie"], ["tim-switzer", "Tim Switzer", "Switzer"],
  ["jack-haley", "Jack Haley", "Haley"], ["bradley-dillon", "Bradley Dillon", "Dillon"],
  ["shawn-smith", "Shawn Smith", "Smith"], ["austin-ketter", "Austin Ketter", "Ketter"],
].map(([slug, fullName, displayName]) => ({
  id: `manager-${slug}`, slug, fullName, displayName, status: "active", aliases: [fullName, displayName], firstSeason: 2017,
}));

export const demoInactiveManagers: Manager[] = [
  { id: "demo-former-1", slug: "demo-former-manager", fullName: "Demo Former Manager", displayName: "Former Manager", status: "inactive", aliases: [], firstSeason: 2017, lastSeason: 2019 },
];
