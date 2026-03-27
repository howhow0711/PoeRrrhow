export type MatchMode = "any" | "all";

export interface QualityFilters {
  regular: string;
  currency: string;
  divination: string;
  rarity: string;
  packSize: string;
  scarab: string;
}

export interface IncludeExcludeToggle {
  enabled: boolean;
  include: boolean;
}

export interface RarityFilter {
  normal: boolean;
  magic: boolean;
  rare: boolean;
  include: boolean;
}

export type MapModKey = string;

export interface GeneratorInput {
  includeKeys: MapModKey[];
  excludeKeys: MapModKey[];
  matchMode: MatchMode;
  quantity: string;
  packSize: string;
  itemRarity: string;
  mapDropChance: string;
  quality: QualityFilters;
  anyQuality: boolean;
  rarity: RarityFilter;
  corrupted: IncludeExcludeToggle;
  unidentified: IncludeExcludeToggle;
  showNightmareMods: boolean;
}

export interface SelectedModSummary {
  key: MapModKey;
  id: number;
  generalizedText: string;
  officialZh: string;
  twAbbr: string;
  regex: string;
  scary: number;
  nightmare: boolean;
  includedByUser: boolean;
  excludedByUser: boolean;
}

export interface GeneratorOutput {
  regex: string;
  selectedMods: SelectedModSummary[];
  warnings: string[];
}

export interface MapModMeta {
  key: MapModKey;
  id: number;
  regexEn: string;
  regexZh: string;
  rawTextEn: string;
  officialZh: string;
  twAbbr: string;
  aliases: string[];
  generalizedText: string;
  scary: number;
  nightmare: boolean;
  category: string;
}
