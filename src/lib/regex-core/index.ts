import { generateChineseMapRegex } from "./generateChineseMapRegex";
import { localizedRegexMapMods, mapModCatalog, mapModCatalogByKey } from "./catalog";
import type {
  GeneratorInput,
  GeneratorOutput,
  MapModKey,
  SelectedModSummary,
} from "../../types/maps";
import type { MapSettings } from "./vendor/upstream/MapSettings";

function keysToIds(keys: MapModKey[], warnings: string[]): number[] {
  return keys.flatMap((key) => {
    const mod = mapModCatalogByKey.get(key);
    if (!mod) {
      warnings.push(`找不到詞綴 key：${key}`);
      return [];
    }
    return [mod.id];
  });
}

function toMapSettings(input: GeneratorInput, warnings: string[]): MapSettings {
  return {
    badIds: keysToIds(input.excludeKeys, warnings),
    goodIds: keysToIds(input.includeKeys, warnings),
    allGoodMods: input.matchMode === "all",
    quantity: input.quantity,
    packsize: input.packSize,
    itemRarity: input.itemRarity,
    optimizeQuant: false,
    optimizePacksize: false,
    optimizeQuality: false,
    displayNightmareMods: input.showNightmareMods,
    rarity: input.rarity,
    corrupted: input.corrupted,
    unidentified: input.unidentified,
    quality: input.quality,
    anyQuality: input.anyQuality,
    customText: {
      value: "",
      enabled: false,
    },
    mapDropChance: input.mapDropChance,
  };
}

function buildSelectedMods(input: GeneratorInput): SelectedModSummary[] {
  const included = new Set(input.includeKeys);
  const excluded = new Set(input.excludeKeys);

  return [...new Set([...input.includeKeys, ...input.excludeKeys])]
    .map((key) => {
      const mod = mapModCatalogByKey.get(key);
      if (!mod) return undefined;
      return {
        key,
        id: mod.id,
        generalizedText: mod.generalizedText,
        officialZh: mod.officialZh,
        twAbbr: mod.twAbbr,
        regex: mod.regexZh,
        scary: mod.scary,
        nightmare: mod.nightmare,
        includedByUser: included.has(key),
        excludedByUser: excluded.has(key),
      };
    })
    .filter((mod): mod is SelectedModSummary => Boolean(mod));
}

export function generateMapRegex(input: GeneratorInput): GeneratorOutput {
  const warnings: string[] = [];
  const settings = toMapSettings(input, warnings);
  const regex = generateChineseMapRegex(settings, localizedRegexMapMods);

  if (!regex) {
    warnings.push("目前條件沒有產生任何 Regex。");
  }

  return {
    regex,
    selectedMods: buildSelectedMods(input),
    warnings,
  };
}

export { mapModCatalog };
