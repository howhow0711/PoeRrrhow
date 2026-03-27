import type { Regex } from "./vendor/upstream/GeneratedTypes";
import { generateNumberRegex } from "./vendor/upstream/GenerateNumberRegex";
import { idToRegex, optimizeRegexFromIds } from "./vendor/upstream/OptimizeRegexResult";
import type { MapSettings } from "./vendor/upstream/MapSettings";

type QualityType = "regular" | "currency" | "divination" | "rarity" | "pack size" | "scarab";

const qualityPrefixes: Record<QualityType, string> = {
  regular: "品質.*物品數量.*",
  currency: "品質.*更多通貨.*",
  divination: "品質.*更多命運卡.*",
  rarity: "品質.*物品稀有度.*",
  "pack size": "品質.*怪物群大小.*",
  scarab: "品質.*更多聖甲蟲.*",
};

export function generateChineseMapRegex(settings: MapSettings, regex: Regex<unknown>): string {
  const exclusions = generateBadMods(settings, regex);
  const inclusions = generateGoodMods(settings, regex);
  const quantity = addQuantifier("物品數量.*", generateNumberRegex(settings.quantity, settings.optimizeQuant));
  const packsize = addQuantifier("怪物群大小.*", generateNumberRegex(settings.packsize, settings.optimizePacksize));
  const mapDrop = addQuantifier("更多地圖.*", generateNumberRegex(settings.mapDropChance, false));
  const itemRarity = addQuantifier("物品稀有度.*", generateNumberRegex(settings.itemRarity, false));
  const quality = qualityQualifier(settings);
  const rarity = addRarityRegex(settings.rarity.normal, settings.rarity.magic, settings.rarity.rare, settings.rarity.include);
  const corrupted = corruptedMapCheck(settings);
  const unidentified = unidentifiedMap(settings);

  return `${exclusions} ${inclusions} ${quantity} ${packsize} ${itemRarity} ${quality} ${rarity} ${mapDrop} ${corrupted} ${unidentified}`
    .trim()
    .replaceAll(/\s{2,}/g, " ")
    .replaceAll(`"!"`, "");
}

function unidentifiedMap(settings: MapSettings): string {
  if (!settings.unidentified.enabled) return "";
  return settings.unidentified.include ? "未鑑定" : "!未鑑定";
}

function corruptedMapCheck(settings: MapSettings): string {
  if (!settings.corrupted.enabled) return "";
  return settings.corrupted.include ? "已汙染" : "!已汙染";
}

function qualityQualifier(settings: MapSettings): string {
  const result = [
    addQuantifier(qualityPrefixes.regular, generateNumberRegex(settings.quality.regular, settings.optimizeQuality)),
    addQuantifier(qualityPrefixes.currency, generateNumberRegex(settings.quality.currency, settings.optimizeQuality)),
    addQuantifier(qualityPrefixes.divination, generateNumberRegex(settings.quality.divination, settings.optimizeQuality)),
    addQuantifier(qualityPrefixes.rarity, generateNumberRegex(settings.quality.rarity, settings.optimizeQuality)),
    addQuantifier(qualityPrefixes["pack size"], generateNumberRegex(settings.quality.packSize, settings.optimizeQuality)),
    addQuantifier(qualityPrefixes.scarab, generateNumberRegex(settings.quality.scarab, settings.optimizeQuality)),
  ].filter(Boolean);

  if (!settings.anyQuality) {
    return result.join(" ");
  }
  if (result.length === 0) {
    return "";
  }
  return `"${result.map((value) => value.slice(1, -1)).join("|")}"`;
}

function generateBadMods(settings: MapSettings, regex: Regex<unknown>): string {
  if (settings.badIds.length === 0) return "";
  const tokens = optimizeRegexFromIds(settings.badIds, regex);
  return `"!${tokens.join("|")}"`;
}

function generateGoodMods(settings: MapSettings, regex: Regex<unknown>): string {
  if (settings.goodIds.length === 0) return "";
  const tokens = settings.goodIds
    .map((id) => idToRegex(id, regex))
    .filter((value): value is string => value !== undefined)
    .filter(onlyUnique);

  if (settings.allGoodMods) {
    return tokens.map((token) => (token.includes(" ") ? `"${token}"` : token)).join(" ");
  }
  return `"${tokens.join("|")}"`;
}

function onlyUnique(value: string, index: number, array: string[]): boolean {
  return array.indexOf(value) === index;
}

function addRarityRegex(normal: boolean, magic: boolean, rare: boolean, include: boolean): string {
  if (normal && magic && rare) {
    return include ? "" : `"!稀有度: (普通|魔法|稀有)"`;
  }

  const values = [
    normal ? "普通" : "",
    magic ? "魔法" : "",
    rare ? "稀有" : "",
  ].filter(Boolean);

  if (values.length === 0) return "";

  const joined = values.length === 1 ? values[0] : `(${values.join("|")})`;
  return `"${include ? "" : "!"}稀有度: ${joined}"`;
}

function addQuantifier(prefix: string, value: string): string {
  if (!value) return "";
  return `"${prefix}${value}%"`;
}
