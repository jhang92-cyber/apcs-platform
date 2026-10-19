# APCS 訓練網站

APCS 資訊學科學能力檢定線上練習平台（完整版 MVP），內建：

- 🔐 **使用者登入/註冊**（Supabase Auth）
- 📋 **題目瀏覽與詳情**（難度分類、分數、限制條件）
- 💻 **線上程式編輯器**（Monaco Editor，支援 C++ / Java / Python / C）
- 🧪 **多組測資即時評分**（自動比對輸出，顯示每組測資通過/失敗）
- 📊 **解題紀錄與個人進度**（解題數、提交數、正確率）
- ⏱️ **模擬考計時模式**（多題連續作答、倒計時、自動儲存作答）
- 🗄️ **Supabase PostgreSQL 資料庫**（題目、測資、提交紀錄、使用者資料）

---

## 🚀 快速開始

### 1. 安裝 Node.js

這台機器尚未安裝 Node.js，請先至 [nodejs.org](https://nodejs.org/) 下載並安裝 **LTS 版本**。

安裝完成後，重新開啟終端機確認：

```powershell
node --version
npm --version
```

### 2. 安裝依賴

```powershell
cd C:\Users\user\Documents\預設專案\apcs-training
npm install
```

### 3. 設定 Supabase（資料庫 + 認證）

1. 前往 [https://supabase.com](https://supabase.com) 建立免費專案
2. 在專案設定頁面取得 **Project URL** 與 **anon public key**
3. 將 `.env.example` 複製為 `.env.local` 並填入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
PORT=3001
```

4. 在 Supabase 的 **SQL Editor** 中，依序執行：
   - `schema.sql`（建立資料表與範例題目/測資）
   - `sql/functions.sql`（建立遞增解題數函式）

### 4. 安裝評分所需編譯器（Windows）

本地端評分需要系統已安裝對應編譯器：

| 語言 | 必要工具 | 安裝方式 |
|------|---------|---------|
| C++ | `g++` | [MinGW-w64](https://www.mingw-w64.org/) 或 [MSYS2](https://www.msys2.org/) |
| C | `gcc` | 同上 |
| Java | `javac` / `java` | [Eclipse Temurin JDK](https://adoptium.net/) |
| Python | `python` | [python.org](https://www.python.org/) |

安裝後請將對應的 `bin` 資料夾加入系統 **PATH**，並確認能在命令列執行 `g++`、`javac`、`python`。

> ⚠️ 安裝後請**重新開啟終端機**才能生效。

### 5. 啟動開發伺服器（Port 3001）

為了避免與政府採購網的 3000 port 衝突，本專案預設使用 **3001**：

```powershell
npm run dev
```

然後開啟瀏覽器：[http://localhost:3001](http://localhost:3001)

---

## 📁 專案結構

```
apcs-training/
├── app/
│   ├── layout.tsx              # 根佈局 + SessionProvider + Navbar
│   ├── page.tsx                # 首頁（題目列表 + 個人統計）
│   ├── login/page.tsx          # 登入
│   ├── register/page.tsx       # 註冊
│   ├── profile/page.tsx        # 個人頁面（解題統計）
│   ├── problems/[id]/page.tsx  # 題目詳情 + 編輯器 + 評分結果 + 提交紀錄
│   ├── mock-exam/page.tsx      # 模擬考（選擇/作答/結果）
│   └── api/
│       ├── problems/route.ts           # 題目列表 API
│       ├── submit/route.ts             # 評分 API（多組測資）
│       ├── submissions/route.ts        # 提交紀錄 API
│       └── user/progress/route.ts      # 個人進度 API
├── components/
│   ├── LayoutNavbar.tsx        # 導覽列（登入/註冊/登出）
│   ├── ProblemCard.tsx         # 題目卡片
│   ├── CodeEditor.tsx          # Monaco Editor 包裝
│   ├── TestCaseResult.tsx      # 單組測資結果顯示
│   ├── SubmissionHistory.tsx   # 提交紀錄表格
│   └── MockExamTimer.tsx       # 模擬考倒計時計時器
├── lib/
│   ├── supabase/server.ts    # Server Side Supabase Client
│   └── supabase/browser.ts   # Client Side Supabase Client
├── middleware.ts               # Supabase Auth 中介軟體
├── types/index.ts              # TypeScript 類型定義
├── schema.sql                  # 資料庫結構
├── sql/functions.sql           # 資料庫函式
├── .env.example                # 環境變數範例
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## ⚠️ 安全性提醒（重要）

目前的評分 API 是在 Next.js Server 端直接呼叫 `g++` / `javac` / `python` 編譯並執行使用者上傳的程式碼，**沒有沙箱隔離**，只適合本地學習與 MVP 演示。

如果要對外開放或部署到生產環境，務必：

1. 改用 **Docker 容器** 隔離執行（限制 CPU、記憶體、網路、檔案系統存取）
2. 加入 **執行時間上限** 與 **記憶體上限**
3. 加入 **使用者認證與提交頻率限制**（防止刷頻攻擊）
4. 考慮使用專門的 Judge 系統（如 [DOMjudge](https://www.domjudge.org/)）

---

## 🛠️ 接下步可擴展

- [ ] 多組測資自動評分（已實作）
- [ ] 使用者登入與解題紀錄（已實作）
- [ ] Supabase PostgreSQL 資料庫整合（已實作）
- [ ] 模擬考計時模式（已實作）
- [ ] 題目題解與官方程式碼
- [ ] 全站排行榜
- [ ] 程式碼沙箱（Docker）
- [ ] 即時排名與競賽模式

---

## 📄 授權

MIT