# Crypto Market Monitor

Live Polymarket crypto up/down monitor — order book and trade feed for short-interval markets.

**Made by Boris ([@SuperAdam47](https://github.com/SuperAdam47))**

## Features

- **Multi-market** — BTC, ETH, SOL, XRP at 5m and 15m intervals
- **Live order book** — bids/asks, spread, last price; Trade Up / Trade Down tabs
- **Live trade feed** — real-time trades via WebSocket; whale alerts (≥ $500)
- **On-demand loading** — only the selected market streams data
- **Desktop app** — Electron wrapper included

## Run

```bash
npm install
npm run electron:dev
```

## Build

```bash
npm run build
npm run electron:build
```

## Config

Optional `.env`:

```
VITE_GAMMA_API_URL=https://gamma-api.polymarket.com
```

## License

[MIT](LICENSE)
