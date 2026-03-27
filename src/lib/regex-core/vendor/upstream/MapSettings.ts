export interface MapSettings {
  badIds: number[];
  goodIds: number[];
  allGoodMods: boolean;
  quantity: string;
  packsize: string;
  itemRarity: string;
  optimizeQuant: boolean;
  optimizePacksize: boolean;
  optimizeQuality: boolean;
  displayNightmareMods: boolean;
  rarity: {
    normal: boolean;
    magic: boolean;
    rare: boolean;
    include: boolean;
  };
  corrupted: {
    enabled: boolean;
    include: boolean;
  };
  unidentified: {
    enabled: boolean;
    include: boolean;
  };
  quality: {
    regular: string;
    currency: string;
    divination: string;
    rarity: string;
    packSize: string;
    scarab: string;
  };
  anyQuality: boolean;
  customText: {
    value: string;
    enabled: boolean;
  };
  mapDropChance: string;
}
