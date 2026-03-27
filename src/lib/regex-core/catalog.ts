import { regexMapModsCHINESE } from "./vendor/upstream/Generated.MapModsV3.CHINESE";
import { regexMapModsENGLISH } from "./vendor/upstream/Generated.MapModsV3.ENGLISH";
import { createMapModKey, normalizeGeneralizedText } from "./keys";
import { getLabelOverride } from "./labels";
import type { Regex, MapModsTokenOption } from "./vendor/upstream/GeneratedTypes";
import type { MapModMeta } from "../../types/maps";

function inferCategory(rawText: string): string {
  const text = rawText.toLowerCase();
  if (text.includes("players are cursed")) return "詛咒";
  if (text.startsWith("players")) return "玩家限制";
  if (text.includes("unique boss") || text.includes("map boss")) return "頭目";
  if (
    text.includes("area has patches") ||
    text.includes("area contains") ||
    text.includes("area is inhabited") ||
    text.startsWith("area ")
  ) {
    return "區域環境";
  }
  if (text.includes("rare monsters") || text.includes("magic monsters")) return "怪群";
  if (text.startsWith("monsters")) {
    if (
      text.includes("reflect") ||
      text.includes("resistance") ||
      text.includes("damage reduction") ||
      text.includes("cannot")
    ) {
      return "怪物防禦";
    }
    return "怪物攻勢";
  }
  return "其他";
}

const chineseById = new Map(regexMapModsCHINESE.tokens.map((token) => [token.id, token]));

function buildRegexFromOfficialZh(officialZh: string): string {
  return officialZh
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) =>
      part
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/%#/g, "\\d+%")
        .replace(/#%/g, "\\d+%")
        .replace(/#/g, "\\d+"),
    )
    .join("|");
}

const localizedTokens: Regex<MapModsTokenOption>["tokens"] = regexMapModsENGLISH.tokens.map((englishToken) => {
  const chineseToken = chineseById.get(englishToken.id);
  const slug = normalizeGeneralizedText(englishToken.generalizedText);
  const override = getLabelOverride(englishToken.id, slug);
  const officialZh = override.officialZh ?? chineseToken?.rawText ?? englishToken.rawText;

  return {
    id: englishToken.id,
    regex: chineseToken?.regex ?? buildRegexFromOfficialZh(officialZh),
    rawText: officialZh,
    generalizedText: chineseToken?.generalizedText ?? englishToken.generalizedText,
    options: englishToken.options,
  };
});

const localizedTokenById = new Map(localizedTokens.map((token) => [token.id, token]));

export const localizedRegexMapMods: Regex<MapModsTokenOption> = {
  tokens: localizedTokens,
  optimizationTable: regexMapModsCHINESE.optimizationTable,
};

export const mapModCatalog: MapModMeta[] = regexMapModsENGLISH.tokens.map((englishToken) => {
  const chineseToken = chineseById.get(englishToken.id);
  const slug = normalizeGeneralizedText(englishToken.generalizedText);
  const override = getLabelOverride(englishToken.id, slug);
  const officialZh = override.officialZh ?? chineseToken?.rawText ?? englishToken.rawText;
  const localizedToken = localizedTokenById.get(englishToken.id);
  const twAbbr = override.twAbbr ?? "";
  const aliases = [officialZh, twAbbr, ...(override.aliases ?? [])].filter(Boolean);

  return {
    key: createMapModKey(englishToken.id, englishToken.generalizedText),
    id: englishToken.id,
    regexEn: englishToken.regex,
    regexZh: localizedToken?.regex ?? buildRegexFromOfficialZh(officialZh),
    rawTextEn: englishToken.rawText,
    officialZh,
    twAbbr,
    aliases,
    generalizedText: englishToken.generalizedText,
    scary: englishToken.options.scary,
    nightmare: englishToken.options.nm,
    category: inferCategory(englishToken.rawText),
  };
});

export const mapModCatalogByKey = new Map(mapModCatalog.map((mod) => [mod.key, mod]));
