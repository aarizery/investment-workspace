# Atlasio Workspace

> Bloomberg-style macro + equity dashboard. Regime signals, bias scoring, live charts, heatmaps, alerts, and portfolio tracking — all in a dark terminal UI.

![Version](https://img.shields.io/badge/version-1.1.0-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Panels

| Panel | Description |
|---|---|
| **Macro Driver Board** | S&P 500, Gold, Copper, Crude, 10Y Yield, DXY, BTC, VIX — live regime + S&R |
| **Candlestick Chart** | OHLCV chart with 1D/5D/1M/3M/6M/1Y — canvas-rendered |
| **Watchlist** | Live quotes, regime tags, support/resistance, impact score, bias bar |
| **Stock Detail** | Metrics, regime meter, bias gauge, analyst summary |
| **Alert System** | Price/change/regime alerts with browser push notifications |
| **Market Heatmap** | Sector-grouped color tiles by % change intensity |
| **Sector Rotation** | 11 SPDR ETFs ranked by performance with regime badges |
| **Portfolio Tracker** | Manual P&L tracker — real-time mark-to-market |
| **News Panel** | Live Yahoo Finance news with bull/bear signal classification |
| **Macro Events** | Economic calendar with prior/forecast/impact ratings |
| **Ticker Tape** | Scrolling live macro prices in top bar |

---

## Regime Engine

| Condition | Regime |
|---|---|
| Price > MA50 > MA200 | ✅ Uptrend |
| Price < MA50 < MA200 | 🔴 Breakdown |
| Mixed MA signals | 🟡 Transition |

---

## Stack

- **React 18** + **Vite 5** — fast dev + optimised builds
- **IBM Plex Mono** typography — Bloomberg terminal aesthetic
- **Canvas API** — candlestick charting, zero chart-lib dependency
- **Yahoo Finance** (public API via CORS proxy) — live quotes, OHLCV, news
- **Express proxy** (`server/`) — backend relay to avoid browser CORS blocks

---

## Quick Start (Local)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/atlasio-workspace.git
cd atlasio-workspace

# 2. Install frontend deps
npm install

# 3. Run frontend (uses corsproxy.io for data by default)
npm run dev
# → http://localhost:3000
```

### Optional: Run the backend proxy (recommended for production)

```bash
cd server
npm install
node proxy.js
# → http://localhost:3001
```

Then in `src/lib/dataService.js`, swap the CORS constant:
```js
// Change this:
const CORS = 'https://corsproxy.io/?'
// To your proxy:
const API_BASE = 'http://localhost:3001/api'
```

---

## Deploy to GitHub + Vercel (Full Steps)

### Step 1 — Create GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `atlasio-workspace`
3. Set to **Private** (recommended) or Public
4. **Do NOT** initialise with README (you already have one)
5. Click **Create repository**

### Step 2 — Push your code

```bash
cd atlasio-workspace

git init
git add .
git commit -m "feat: initial Atlasio Workspace"

git remote add origin https://github.com/YOUR_USERNAME/atlasio-workspace.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy to Vercel (free tier, instant)

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts:
- Framework: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

Or connect via the Vercel dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework: **Vite** — Vercel auto-detects
4. Click **Deploy**

### Step 4 — Set up CI/CD (auto-deploy on push)

The `.github/workflows/deploy.yml` file is already included.

Add these secrets to your GitHub repo (**Settings → Secrets → Actions**):

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Run `vercel env pull` and check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same as above |

Now every push to `main` auto-deploys. PRs get preview deployments.

---

## Project Structure

```
atlasio-workspace/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD — build + Vercel deploy
├── server/
│   ├── proxy.js                # Express CORS proxy for Yahoo Finance
│   └── package.json
├── src/
│   ├── components/
│   │   ├── TopBar.jsx          # Ticker tape, clock, market status
│   │   ├── MacroDriverBoard.jsx # 8 macro assets, regime, S&R
│   │   ├── Watchlist.jsx        # Live stock table, bias, sorting
│   │   ├── StockChart.jsx       # Canvas candlestick + stats bar
│   │   ├── StockDetail.jsx      # Metrics, gauges, regime meter
│   │   ├── AlertSystem.jsx      # Price/regime alerts + notifications
│   │   ├── HeatMap.jsx          # Sector color-intensity tile grid
│   │   ├── SectorRotation.jsx   # SPDR ETF performance ranking
│   │   ├── PortfolioTracker.jsx # Manual P&L with live mark-to-market
│   │   └── NewsPanel.jsx        # Live news + macro events calendar
│   ├── hooks/
│   │   └── useMarketData.js     # Data fetching, polling, enrichment
│   ├── lib/
│   │   └── dataService.js       # Yahoo Finance API + regime/bias logic
│   ├── styles/
│   │   └── globals.css          # Dark terminal theme, CSS variables
│   ├── App.jsx                  # Root layout + tabbed navigation
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Extending Atlasio

### Add a new macro asset

In `src/lib/dataService.js`, add to `MACRO_ASSETS`:
```js
{ symbol: 'ZN=F', label: '10Y Futures', linked: 'TLT', category: 'rates' }
```

### Add a new panel

1. Create `src/components/MyPanel.jsx`
2. Import and add to `App.jsx`
3. Add a new tab entry to the `TABS` array

### Switch to backend proxy

Replace `CORS` in `dataService.js` with your proxy base URL and update fetch paths to `/api/quotes`, `/api/chart/:symbol`, `/api/news`.

---

## Disclaimer

Atlasio Workspace is for informational and educational purposes only. It does not constitute financial advice. Market data is provided by Yahoo Finance and may be delayed.
