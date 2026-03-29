import type { Regex } from "./vendor/upstream/GeneratedTypes";
import { idToRegex, optimizeRegexFromIds } from "./vendor/upstream/OptimizeRegexResult";
import type { MapSettings } from "./vendor/upstream/MapSettings";

type QualityType = "regular" | "currency" | "divination" | "rarity" | "pack size" | "scarab";

const qualityPrefixes: Record<QualityType, string> = {
  regular: "品質.*物品數量.+",
  currency: "品質.*更多通貨.*",
  divination: "品質.*更多命運卡.*",
  rarity: "品質.*物品稀有度.+",
  "pack size": "品質.*怪物群大小.*",
  scarab: "品質.*更多聖甲蟲.+",
};

export function generateChineseMapRegex(settings: MapSettings, regex: Regex<unknown>): string {
  const exclusions = generateBadMods(settings, regex);
  const inclusions = generateGoodMods(settings, regex);
  const quantity = addQuantifier("物品數量.+", generateStashNumberRegex(settings.quantity));
  const packsize = addQuantifier("怪物群大小.*", generateStashNumberRegex(settings.packsize));
  const mapDrop = addQuantifier("更多地圖.*", generateStashNumberRegex(settings.mapDropChance));
  const itemRarity = addQuantifier("物品稀有度.+", generateStashNumberRegex(settings.itemRarity));
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
    addQuantifier(qualityPrefixes.regular, generateStashNumberRegex(settings.quality.regular)),
    addQuantifier(qualityPrefixes.currency, generateStashNumberRegex(settings.quality.currency)),
    addQuantifier(qualityPrefixes.divination, generateStashNumberRegex(settings.quality.divination)),
    addQuantifier(qualityPrefixes.rarity, generateStashNumberRegex(settings.quality.rarity)),
    addQuantifier(qualityPrefixes["pack size"], generateStashNumberRegex(settings.quality.packSize)),
    addQuantifier(qualityPrefixes.scarab, generateStashNumberRegex(settings.quality.scarab)),
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
  return `"${prefix}${value}"`;
}

function generateStashNumberRegex(number: string): string {
  const digits = number.match(/\d+/g)?.join("") ?? "";
  if (!digits) return "";

  const threshold = Number(digits);
  if (Number.isNaN(threshold)) return "";
  if (threshold <= 0) return "\\d";

  if (threshold < 10) {
    return `(${digitRange(threshold, 9)}|\\d{2})`;
  }

  if (threshold === 10) {
    return "\\d{2}";
  }

  if (threshold < 100) {
    const tens = Math.floor(threshold / 10);
    const ones = threshold % 10;

    if (ones === 0) {
      return `(${digitRange(tens, 9)}\\d|\\d{3})`;
    }

    if (tens === 9) {
      return `(${digit(tens)}${digitRange(ones, 9)}|\\d{3})`;
    }

    return `(${digit(tens)}${digitRange(ones, 9)}|${digitRange(tens + 1, 9)}\\d|\\d{3})`;
  }

  if (threshold === 100) {
    return "\\d{3}";
  }

  if (threshold < 1000) {
    const hundreds = Math.floor(threshold / 100);
    const tens = Math.floor(threshold / 10) % 10;
    const ones = threshold % 10;
    const parts: string[] = [];

    if (tens === 0 && ones === 0) {
      if (hundreds === 1) {
        return "\\d{3}";
      }
      return `(${digitRange(hundreds, 9)}\\d\\d|\\d{4})`;
    }

    if (ones === 0) {
      parts.push(`${digit(hundreds)}${digitRange(tens, 9)}\\d`);
    } else {
      parts.push(`${digit(hundreds)}${digit(tens)}${digitRange(ones, 9)}`);
      if (tens < 9) {
        parts.push(`${digit(hundreds)}${digitRange(tens + 1, 9)}\\d`);
      }
    }

    if (hundreds < 9) {
      parts.push(`${digitRange(hundreds + 1, 9)}\\d\\d`);
    }
    parts.push("\\d{4}");

    return `(${parts.join("|")})`;
  }

  return `\\d{${String(threshold).length}}`;
}

function digit(value: number): string {
  return `[${value}]`;
}

function digitRange(start: number, end: number): string {
  return start === end ? `[${start}]` : `[${start}-${end}]`;
}
