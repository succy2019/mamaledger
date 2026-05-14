# MamaLedger

Voice-first, offline-first PWA for Nigerian market traders.

## Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 + React Router v7
- **Offline**: Dexie.js (IndexedDB) + TanStack Query
- **Voice**: Web Speech API (SpeechRecognition)
- **Backend**: Hono.js on Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **PWA**: vite-plugin-pwa (Workbox)

## Getting Started

```bash
npm install
npm run dev
```

## Cloudflare D1 Setup

```bash
# Create the D1 database
wrangler d1 create mamaledger-db

# Copy the database_id into wrangler.toml

# Run migrations
wrangler d1 execute mamaledger-db --file=schema.sql

# For production
wrangler d1 execute mamaledger-db --file=schema.sql --remote
```

## Deploy

```bash
npm run build
npm run deploy
```

## PWA Icons

Place icons at:
- `public/icons/pwa-192.png` (192×192)
- `public/icons/pwa-512.png` (512×512)

Use a green mic icon on `#00450d` background.
