# Coffee Atlas V1.6 — Excel → JSON Data Pipeline

這一包不修改 V1.5.2 的 Navbar / Favorites / UI。

## 上傳到 GitHub
把壓縮檔中的內容放到 coffee-atlas repository 根目錄：

coffee-atlas/
├─ Coffee_Atlas_Database_V1.6.xlsx
├─ scripts/
│  └─ excel_to_json.py
├─ .github/
│  └─ workflows/
│     └─ update-coffee-data.yml
└─ data/
   └─ atlas.json

## 之後怎麼更新豆子
1. 編輯 Coffee_Atlas_Database_V1.6.xlsx
2. GitHub 上傳 / commit 新版 Excel
3. GitHub Actions 自動執行 excel_to_json.py
4. 自動更新 data/atlas.json
5. GitHub Pages 繼續讀 data/atlas.json

## 重要規則
- Bean ID = 唯一身分證。已上線後不要隨意修改，否則 Favorites 會失去對應。
- Farm ID / Region ID / Country ID 是資料關聯鍵。
- Status = Draft 的列不會發布到網站。
- 感官評分空白就保持 null，不用填 0。
- Source URL 建議填官方或第一手來源。
