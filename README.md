# POEmaps

台服可用的 POE 地圖詞綴中文 Regex 產生器。

目前專案是 `React + Vite + TypeScript` 的純前端靜態站，沒有後端、沒有帳號系統，也沒有外部 API 依賴，適合直接部署到 `GitHub Pages`。

## 本機開發

```bash
npm ci
npm run dev
```

常用指令：

```bash
npm run build
npm test
npm run lint
```

## GitHub Pages 部署

這個專案已內建 GitHub Pages workflow：

- Workflow 檔案：`.github/workflows/deploy.yml`
- 觸發條件：push 到 `main`
- 建置流程：`npm ci` -> `npm run build` -> deploy `dist`

建議部署方式：

1. 建立公開 GitHub 倉庫，優先使用 `<你的 GitHub 使用者名稱>.github.io`
2. 把這個專案 push 到該倉庫的 `main`
3. 到 GitHub 倉庫設定頁：
   - `Settings`
   - `Pages`
   - `Build and deployment`
   - `Source` 選 `GitHub Actions`
4. 等待 Actions 跑完
5. 用 GitHub Pages 網址確認站點可開

如果你的倉庫不是 `<username>.github.io`，Vite 設定會在 GitHub Actions 內自動改用 `/<repo-name>/` 當作 base path，避免靜態資源 404。

## 上線後檢查清單

- 首頁可以正常開啟
- 捲動時 Regex 輸出列會固定在畫面上
- 一般詞與夢魘詞都能正常產生中文 Regex
- 複製按鈕可正常使用
- 手機版與桌機版版面都正常

## 資訊安全與公開上線注意事項

- 這是公開靜態站，任何放進前端 bundle 的內容都可被使用者看到
- 不要把 API key、token、帳號密碼或任何秘密放進前端程式碼
- 不要把敏感資料提交到 Git 歷史中，即使之後刪掉也可能仍可追溯
- 如果未來加入第三方 script、外部資料源或匯入功能，要重新檢查 XSS 與惡意內容風險
- 這不是官方網站，建議保留頁面內的非官方聲明，避免玩家誤認

## 備註

- 非官方工具，與 Grinding Gear Games 與台服營運方無隸屬關係
- 第一版以免費、最省事的 GitHub Pages 為主；後續若要更細的安全控制、CDN 或流量防護，可再評估 Cloudflare Pages
