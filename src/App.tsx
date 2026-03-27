import { useMemo, useState } from "react";
import "./index.css";
import { generateMapRegex, mapModCatalog } from "./lib/regex-core";
import type {
  GeneratorInput,
  IncludeExcludeToggle,
  MapModKey,
  MapModMeta,
  QualityFilters,
  RarityFilter,
} from "./types/maps";

const defaultQuality: QualityFilters = {
  regular: "",
  currency: "",
  divination: "",
  rarity: "",
  packSize: "",
  scarab: "",
};

const defaultRarity: RarityFilter = {
  normal: true,
  magic: true,
  rare: true,
  include: true,
};

const defaultToggle: IncludeExcludeToggle = {
  enabled: false,
  include: true,
};

function scoreTone(scary: number): string {
  if (scary >= 900) return "fatal";
  if (scary >= 500) return "danger";
  if (scary >= 200) return "warn";
  return "calm";
}

const categoryOrder = ["夢魘", "玩家限制", "怪物防禦", "怪物攻勢", "其他", "詛咒", "頭目", "區域環境", "怪群"];
const categoryRank: Record<string, number> = Object.fromEntries(
  categoryOrder.map((category, index) => [category, index]),
);

function getDisplayCategory(mod: MapModMeta): string {
  return mod.nightmare ? "夢魘" : mod.category;
}

function sortByCategoryAndRisk(left: (typeof mapModCatalog)[number], right: (typeof mapModCatalog)[number]): number {
  const leftCategory = getDisplayCategory(left);
  const rightCategory = getDisplayCategory(right);

  if (leftCategory !== rightCategory) {
    return (categoryRank[leftCategory] ?? Number.MAX_SAFE_INTEGER) - (categoryRank[rightCategory] ?? Number.MAX_SAFE_INTEGER);
  }

  return right.scary - left.scary || left.officialZh.localeCompare(right.officialZh, "zh-Hant");
}

function buildSearchText(mod: (typeof mapModCatalog)[number]): string {
  return [mod.officialZh, mod.twAbbr, ...mod.aliases, mod.rawTextEn, mod.generalizedText].join(" ").toLowerCase();
}

function App() {
  const [includeKeys, setIncludeKeys] = useState<MapModKey[]>([]);
  const [excludeKeys, setExcludeKeys] = useState<MapModKey[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [matchMode, setMatchMode] = useState<"any" | "all">("all");
  const [showNightmareMods, setShowNightmareMods] = useState(false);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packSize, setPackSize] = useState("");
  const [itemRarity, setItemRarity] = useState("");
  const [mapDropChance, setMapDropChance] = useState("");
  const [quality, setQuality] = useState<QualityFilters>(defaultQuality);
  const [anyQuality, setAnyQuality] = useState(true);
  const [rarity, setRarity] = useState<RarityFilter>(defaultRarity);
  const [corrupted, setCorrupted] = useState<IncludeExcludeToggle>(defaultToggle);
  const [unidentified, setUnidentified] = useState<IncludeExcludeToggle>({ enabled: false, include: false });
  const [copyStatus, setCopyStatus] = useState("");

  const availableMods = useMemo(
    () => mapModCatalog.filter((mod) => showNightmareMods || !mod.nightmare).sort(sortByCategoryAndRisk),
    [showNightmareMods],
  );

  const filteredMods = useMemo(() => {
    if (!search.trim()) return availableMods;
    const query = search.trim().toLowerCase();
    return availableMods.filter((mod) => buildSearchText(mod).includes(query));
  }, [availableMods, search]);

  const groupedMods = useMemo(
    () =>
      filteredMods.reduce<Record<string, typeof filteredMods>>((acc, mod) => {
        const category = getDisplayCategory(mod);
        acc[category] ??= [];
        acc[category].push(mod);
        return acc;
      }, {}),
    [filteredMods],
  );

  const orderedGroups = useMemo(
    () =>
      Object.entries(groupedMods).sort(
        ([leftCategory], [rightCategory]) =>
          (categoryRank[leftCategory] ?? Number.MAX_SAFE_INTEGER) -
          (categoryRank[rightCategory] ?? Number.MAX_SAFE_INTEGER),
      ),
    [groupedMods],
  );

  const input = useMemo<GeneratorInput>(
    () => ({
      includeKeys,
      excludeKeys,
      matchMode,
      quantity,
      packSize,
      itemRarity,
      mapDropChance,
      quality,
      anyQuality,
      rarity,
      corrupted,
      unidentified,
      showNightmareMods,
    }),
    [
      includeKeys,
      excludeKeys,
      matchMode,
      quantity,
      packSize,
      itemRarity,
      mapDropChance,
      quality,
      anyQuality,
      rarity,
      corrupted,
      unidentified,
      showNightmareMods,
    ],
  );

  const output = useMemo(() => generateMapRegex(input), [input]);

  async function copyRegex() {
    if (!navigator.clipboard?.writeText) {
      setCopyStatus("目前環境不支援剪貼簿複製。");
      return;
    }
    await navigator.clipboard.writeText(output.regex);
    setCopyStatus("Regex 已複製到剪貼簿。");
  }

  function clearAll() {
    setIncludeKeys([]);
    setExcludeKeys([]);
    setCollapsedGroups({});
    setMatchMode("all");
    setShowNightmareMods(false);
    setSearch("");
    setQuantity("");
    setPackSize("");
    setItemRarity("");
    setMapDropChance("");
    setQuality(defaultQuality);
    setAnyQuality(true);
    setRarity(defaultRarity);
    setCorrupted(defaultToggle);
    setUnidentified({ enabled: false, include: false });
    setCopyStatus("");
  }

  function toggleSelection(key: MapModKey, mode: "include" | "exclude", checked: boolean) {
    if (mode === "include") {
      setIncludeKeys((current) => (checked ? [...new Set([...current, key])] : current.filter((item) => item !== key)));
      if (checked) {
        setExcludeKeys((current) => current.filter((item) => item !== key));
      }
      return;
    }

    setExcludeKeys((current) => (checked ? [...new Set([...current, key])] : current.filter((item) => item !== key)));
    if (checked) {
      setIncludeKeys((current) => current.filter((item) => item !== key));
    }
  }

  function toggleGroup(category: string) {
    setCollapsedGroups((current) => ({
      ...current,
      [category]: !(current[category] ?? true),
    }));
  }

  return (
    <main className="app-shell compact-app">
      <section className="toolbar">
        <div>
          <h1>POE 地圖中文 Regex</h1>
        </div>
        <label className="toggle compact-toggle">
          <input
            type="checkbox"
            checked={showNightmareMods}
            onChange={(event) => setShowNightmareMods(event.target.checked)}
          />
          顯示夢魘詞
        </label>
      </section>

      <section className="result-strip">
        <div className="result-strip-main">
          <span className="result-label">輸出 Regex</span>
          <div className="result-box" data-testid="regex-output">{output.regex || "(目前沒有產生 Regex)"}</div>
          {copyStatus ? <p className="copy-status">{copyStatus}</p> : null}
        </div>
        <div className="result-actions">
          <button data-testid="clear-all" className="secondary-button" onClick={clearAll}>
            全部清除
          </button>
          <button data-testid="copy-regex" className="primary-button" onClick={copyRegex}>
            複製
          </button>
        </div>
      </section>

      <section className="controls-panel">
        <div className="search-row">
          <label className="search-grow">
            搜尋詞綴
            <input
              data-testid="mod-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="官方中文 / 台服縮寫 / 英文"
            />
          </label>
          <div className="segmented">
            <button className={matchMode === "all" ? "active" : ""} onClick={() => setMatchMode("all")}>
              全部包含
            </button>
            <button className={matchMode === "any" ? "active" : ""} onClick={() => setMatchMode("any")}>
              任一即可
            </button>
          </div>
        </div>

        <div className="filters-grid compact-grid">
          <label>
            物品數量
            <input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="100" />
          </label>
          <label>
            怪物群大小
            <input value={packSize} onChange={(event) => setPackSize(event.target.value)} placeholder="35" />
          </label>
          <label>
            物品稀有度
            <input value={itemRarity} onChange={(event) => setItemRarity(event.target.value)} placeholder="60" />
          </label>
          <label>
            更多地圖
            <input value={mapDropChance} onChange={(event) => setMapDropChance(event.target.value)} placeholder="40" />
          </label>
          <label>
            品質：更多通貨
            <input value={quality.currency} onChange={(event) => setQuality((current) => ({ ...current, currency: event.target.value }))} />
          </label>
          <label>
            品質：更多聖甲蟲
            <input value={quality.scarab} onChange={(event) => setQuality((current) => ({ ...current, scarab: event.target.value }))} />
          </label>
        </div>

        <div className="option-row">
          <label className="toggle compact-toggle">
            <input type="checkbox" checked={anyQuality} onChange={(event) => setAnyQuality(event.target.checked)} />
            品質條件用 OR
          </label>
          <div className="checkbox-row">
            <label><input type="checkbox" checked={rarity.normal} onChange={(event) => setRarity((current) => ({ ...current, normal: event.target.checked }))} />普通</label>
            <label><input type="checkbox" checked={rarity.magic} onChange={(event) => setRarity((current) => ({ ...current, magic: event.target.checked }))} />魔法</label>
            <label><input type="checkbox" checked={rarity.rare} onChange={(event) => setRarity((current) => ({ ...current, rare: event.target.checked }))} />稀有</label>
          </div>
          <div className="checkbox-row">
            <label><input type="checkbox" checked={corrupted.enabled} onChange={(event) => setCorrupted((current) => ({ ...current, enabled: event.target.checked }))} />汙染</label>
            <label><input type="checkbox" checked={unidentified.enabled} onChange={(event) => setUnidentified((current) => ({ ...current, enabled: event.target.checked }))} />未鑑定</label>
          </div>
        </div>
      </section>

      {output.warnings.length ? (
        <div className="warning-box">
          {output.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <section className="mod-groups compact-groups">
        {orderedGroups.map(([category, mods]) => {
          const collapsed = search.trim() ? false : (collapsedGroups[category] ?? true);

          return (
          <article key={category} className="mod-group">
            <header>
              <button type="button" className="group-toggle" onClick={() => toggleGroup(category)} aria-expanded={!collapsed}>
                <span className="group-toggle-main">
                  <span className={`toggle-arrow ${collapsed ? "collapsed" : ""}`}>▾</span>
                  <h3>{category}</h3>
                </span>
                <span className="group-count">{mods.length} 項</span>
              </button>
            </header>
            {!collapsed ? (
            <div className="mod-list two-col-list">
              {mods.map((mod) => (
                <label className={`mod-row compact-row tone-${scoreTone(mod.scary)}`} key={mod.key}>
                  <div className="mod-main">
                    <div className="mod-title">
                      <strong>{mod.officialZh}</strong>
                      <span>{mod.twAbbr || "未設縮寫"}</span>
                    </div>
                    <div className="mod-subtitle">
                      {mod.nightmare ? <span className="badge nightmare-text">夢魘</span> : null}
                    </div>
                  </div>
                  <div className="mod-actions">
                    <label className="selection-chip selection-chip-exclude">
                      <input
                        data-testid={`exclude-${mod.key}`}
                        type="checkbox"
                        checked={excludeKeys.includes(mod.key)}
                        onChange={(event) => toggleSelection(mod.key, "exclude", event.target.checked)}
                      />
                      排除
                    </label>
                    <label className="selection-chip selection-chip-include">
                      <input
                        data-testid={`include-${mod.key}`}
                        type="checkbox"
                        checked={includeKeys.includes(mod.key)}
                        onChange={(event) => toggleSelection(mod.key, "include", event.target.checked)}
                      />
                      包含
                    </label>
                  </div>
                </label>
              ))}
            </div>
            ) : null}
          </article>
          );
        })}
      </section>

      <footer className="site-footer">
        <p>非官方工具，與 Grinding Gear Games 與台服營運方無隸屬關係。</p>
        <p>本工具為純前端靜態站，請勿在頁面或匯入資料中放入任何帳號、金鑰或其他敏感資訊。</p>
      </footer>
    </main>
  );
}

export default App;
