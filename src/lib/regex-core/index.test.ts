import { describe, expect, it } from "vitest";
import { generateMapRegex, mapModCatalog } from "./index";
import { generatorFixtures } from "../../test/fixtures/generatorFixtures";

describe("generateMapRegex", () => {
  it("returns empty regex for empty selection", () => {
    const actual = generateMapRegex(generatorFixtures[0].input);
    expect(actual.regex).toBe("");
  });

  it("emits chinese stash regex for dangerous map filters", () => {
    const actual = generateMapRegex(generatorFixtures[1].input);
    expect(actual.regex).toContain("已汙染");
    expect(actual.regex).toContain("!未鑑定");
    expect(actual.regex).toContain("物品數量.*");
    expect(actual.regex).toContain("怪物群大小.*");
    expect(actual.regex).toContain("物品稀有度.*");
    expect(actual.regex).toContain("更多地圖.*");
    expect(actual.regex).toContain("稀有度: 稀有");
    expect(actual.regex).not.toContain("m q.*");
    expect(actual.regex).not.toContain("tified");
    expect(actual.regex).not.toContain("pte");
    expect(actual.regex).not.toContain("y:");
  });

  it("supports chinese quality filters in any/all combinations", () => {
    const actual = generateMapRegex(generatorFixtures[2].input);
    expect(actual.regex).toContain("品質.*更多通貨.*");
    expect(actual.regex).toContain("品質.*更多命運卡.*");
  });

  it("returns selected mods with curated chinese labels", () => {
    const actual = generateMapRegex(generatorFixtures[1].input);
    expect(actual.selectedMods).toHaveLength(3);
    expect(actual.selectedMods.every((mod) => !/[a-z]{2,}/i.test(mod.regex))).toBe(true);
    expect(actual.selectedMods.some((mod) => mod.twAbbr === "雙王")).toBe(true);
    expect(actual.selectedMods.some((mod) => mod.excludedByUser)).toBe(true);
  });

  it("emits translated regex for nightmare mods", () => {
    const nightmareMod = mapModCatalog.find((mod) => mod.twAbbr === "三詛咒");
    expect(nightmareMod).toBeDefined();

    const actual = generateMapRegex({
      includeKeys: nightmareMod ? [nightmareMod.key] : [],
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
    });

    expect(actual.regex).toContain("玩家被脆弱詛咒");
    expect(actual.regex).toContain("玩家被時空鎖鏈詛咒");
    expect(actual.regex).toContain("玩家被元素要害詛咒");
    expect(actual.regex).not.toMatch(/[a-z]{3,}/i);
  });
});
