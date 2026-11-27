# ClashForge

An unofficial, mobile-first Clash of Clans fan toolkit built for fast, no-login upgrade planning. Enter your Player Tag once to auto-fill your Town Hall, Hero levels, and Hero Equipment across calculators and guides.

## Core Tools (7)

### Calculators
- **Build Timer**: Speed boost calculator with remaining booster tracking.
- **Hero Tracker**: Dark Elixir and Elixir cost calculator to max any hero for your Town Hall (TH7 to TH18).
- **Equip & Ores**: Shiny, Glowy, and Starry Ore calculator for Hero Equipment levels.
- **Wall Calc**: Total Gold or Elixir needed to max every wall at your Town Hall.
- **Gem Calc**: Exact gem cost to finish any active build or lab timer.
- **Farming Calc**: Estimate how many raids you need to fund your next upgrade.

### Guides
- **Base Maxing Guide**: Priority upgrade checklist per Town Hall aligned to Chief's Journey.

## Key Features
- **1-Tap Player Tag Sync**: Connects through `/api/player?tag=...` (tag only, no password or Supercell ID login) and saves your tag in a browser cookie for instant auto-fill on return visits.
- **Mobile-First Navigation**: Compact top bar with ClashForge logo, slide-down drawer menu, and sticky thumb-friendly bottom navigation bar for phones, plus a responsive desktop layout.
- **Server-Side API Security**: Your Clash of Clans API key stays inside Vercel environment variables and is never exposed in client-side HTML.

## Project Structure

```text
.
├── index.html                    # Complete single-page app (UI, 7 tools, blog, cookie tag sync)
├── favicon.png                   # ClashForge browser favicon
├── api/
│   └── player.js                 # Vercel serverless proxy for the official Clash of Clans API
├── ads.txt                       # Google AdSense verification
├── package.json                  # ES module config for Vercel serverless functions
└── googlebfdcd7435323eb9e.html   # Google Search Console verification
```

## Connecting the Clash of Clans API (Vercel Setup)

Supercell locks Clash of Clans API keys to specific IP addresses. Because Vercel serverless functions use dynamic IPs, using a static-IP proxy is recommended.

1. Sign in to the [Clash of Clans Developer Portal](https://developer.clashofclans.com/), open **My Account**, and click **Create New Key**.
2. In **Allowed IP Addresses**, add `45.79.218.79` (RoyaleAPI's free static proxy IP) and copy your generated API token.
3. In Vercel under **Settings > Environment Variables**, add:
   - `coc_api` = your Clash of Clans API token
   - `COC_PROXY_URL` = `https://cocproxy.royaleapi.dev/v1`
4. Redeploy your Vercel project.

## Disclaimer

ClashForge is an unofficial fan toolkit and is not affiliated with, endorsed by, sponsored by, or specifically approved by Supercell Oy. Clash of Clans is a trademark of Supercell Oy. Calculated values are community-based estimates and may vary in-game.
