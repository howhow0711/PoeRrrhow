import type { GeneratorInput } from "../../types/maps";
import { mapModCatalog } from "../../lib/regex-core";

const byOfficialZh = new Map(mapModCatalog.map((mod) => [mod.officialZh, mod.key]));

function keyFromZh(text: string): string {
  const key = byOfficialZh.get(text);
  if (!key) {
    throw new Error(`Missing fixture key for ${text}`);
  }
  return key;
}

export const generatorFixtures: Array<{ name: string; input: GeneratorInput }> = [
  {
    name: "empty-selection",
    input: {
      includeKeys: [],
      excludeKeys: [],
      matchMode: "all",
      quantity: "",
      packSize: "",
      itemRarity: "",
      mapDropChance: "",
      quality: {
        regular: "",
        currency: "",
        divination: "",
        rarity: "",
        packSize: "",
        scarab: "",
      },
      anyQuality: true,
      rarity: { normal: true, magic: true, rare: true, include: true },
      corrupted: { enabled: false, include: true },
      unidentified: { enabled: false, include: false },
      showNightmareMods: false,
    },
  },
  {
    name: "dangerous-mods-and-thresholds",
    input: {
      includeKeys: [keyFromZh("地圖含有兩個傳奇頭目")],
      excludeKeys: [
        keyFromZh("怪物反射 (13-18)% 物理傷害"),
        keyFromZh("怪物反射 (13-18)% 元素傷害"),
      ],
      matchMode: "all",
      quantity: "80",
      packSize: "25",
      itemRarity: "60",
      mapDropChance: "40",
      quality: {
        regular: "15",
        currency: "",
        divination: "",
        rarity: "",
        packSize: "",
        scarab: "",
      },
      anyQuality: true,
      rarity: { normal: false, magic: false, rare: true, include: true },
      corrupted: { enabled: true, include: true },
      unidentified: { enabled: true, include: false },
      showNightmareMods: false,
    },
  },
  {
    name: "mixed-any-mode",
    input: {
      includeKeys: [
        keyFromZh("區域有數道奉獻地面"),
        keyFromZh("地圖含有燃燒地面"),
      ],
      excludeKeys: [keyFromZh("玩家被脆弱詛咒")],
      matchMode: "any",
      quantity: "",
      packSize: "",
      itemRarity: "",
      mapDropChance: "",
      quality: {
        regular: "",
        currency: "10",
        divination: "10",
        rarity: "",
        packSize: "",
        scarab: "",
      },
      anyQuality: false,
      rarity: { normal: true, magic: true, rare: true, include: true },
      corrupted: { enabled: false, include: true },
      unidentified: { enabled: false, include: false },
      showNightmareMods: false,
    },
  },
  {
    name: "all-selection",
    input: {
      includeKeys: mapModCatalog.slice(0, 24).map((mod) => mod.key),
      excludeKeys: [],
      matchMode: "all",
      quantity: "",
      packSize: "",
      itemRarity: "",
      mapDropChance: "",
      quality: {
        regular: "",
        currency: "",
        divination: "",
        rarity: "",
        packSize: "",
        scarab: "",
      },
      anyQuality: true,
      rarity: { normal: true, magic: true, rare: true, include: true },
      corrupted: { enabled: false, include: true },
      unidentified: { enabled: false, include: false },
      showNightmareMods: true,
    },
  },
];
