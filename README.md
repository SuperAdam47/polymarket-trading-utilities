# Polymarket Trading Utilities

Live monitoring tools for [Polymarket](https://polymarket.com) crypto up/down markets. The primary app tracks real-time order books and trade flow for short-interval prediction markets on Bitcoin, Ethereum, Solana, and XRP.

Runs in the browser or as a desktop app via Electron.

## Features

### Crypto Up/Down Monitor

- **Multi-market support** — BTC, ETH, SOL, and XRP at 5-minute and 15-minute intervals
- **Live order book** — depth chart with bid/ask levels, spread, and last price; toggle between Up and Down outcomes
- **Live trade feed** — recent trades streamed over WebSocket with whale alerts (trades ≥ $500 highlighted)
- **Auto-rotation** — discovers the current market window and refreshes when a new interval starts
- **Connection status** — live indicator and manual refresh

### Additional utilities (in codebase)

The repo also includes Polymarket portfolio, profile, and balance helpers under `src/features/polymarket/` and `src/lib/polymarket/`. These are built on the same UI stack and can be wired back into routing if needed.

## Tech Stack

| Layer | Tools |
| --- | --- |
| UI | React 19, Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) |
| Build | [Vite](https://vitejs.dev/) |
| Desktop | [Electron](https://www.electronjs.org/) |
| Data | Polymarket Gamma API, CLOB REST + WebSocket |
| Language | TypeScript |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (recommended) or npm

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/SuperAdam47/polymarket-trading-utilities.git
cd polymarket-trading-utilities
pnpm install
```

### 2. Environment variables

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_POLYMARKET_WALLET_ADDRESS` | Wallet address for portfolio/profile features | — |
| `VITE_POLYGON_RPC_URL` | Polygon RPC endpoint | `https://polygon-bor-rpc.publicnode.com` |
| `VITE_GAMMA_API_URL` | Polymarket Gamma API | `https://gamma-api.polymarket.com` |
| `VITE_DATA_API_URL` | Polymarket Data API | `https://data-api.polymarket.com` |

The monitor app works without a wallet address. Portfolio-related features require a valid `VITE_POLYMARKET_WALLET_ADDRESS`.

### 3. Run

**Web (development)**

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

**Desktop (development)**

```bash
pnpm electron:dev
```

**Production build**

```bash
pnpm build          # web build → dist/
pnpm electron:build # desktop installer → release/
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Vite dev server |
| `pnpm electron:dev` | Start Vite + Electron together |
| `pnpm build` | Type-check and build for production |
| `pnpm electron:build` | Build web app and package Electron installer |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm knip` | Find unused exports and dependencies |

## Project Structure

```
src/
├── app/                    # Crypto up/down monitor (current entry point)
│   ├── App.tsx
│   ├── components/         # OrderBook, TradeAlerts
│   └── hooks/              # useBtcMarketData
├── lib/polymarket/         # API clients, order book, WebSocket, market discovery
├── features/polymarket/    # Portfolio, profile, and layout components
└── components/ui/          # shadcn/ui components

electron/                   # Electron main process
scripts/                    # Utility scripts (e.g. probe-funding.mjs)
```

## How It Works

1. **Market discovery** — `fetchCurrentMarket()` resolves the active up/down market slug from the Gamma API based on asset, interval, and current time window.
2. **Order book** — Initial snapshot from the CLOB REST API (`/book`), then incremental updates via WebSocket price-change events.
3. **Trades** — Subscribed through Polymarket's CLOB WebSocket (`wss://ws-subscriptions-clob.polymarket.com/ws/market`); large trades are flagged when USD value meets the whale threshold.

## Credits

UI components are based on [shadcn-admin](https://github.com/satnaing/shadcn-admin) by [@satnaing](https://github.com/satnaing), licensed under the [MIT License](LICENSE).

## License

[MIT](LICENSE)
