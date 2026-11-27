# ClashForge — Town Hall 19 Clash of Clans Toolkit

ClashForge is a fast, mobile-friendly Clash of Clans upgrade planner and calculator suite with live Player Tag sync, real-time event countdowns, and automated game data updates.

## Core Tools (8 Practical Utilities)
1. **Build Timer** — Speed boost calculator with Gold Pass, Builder Potion, and live completion timing.
2. **Hero Tracker** — Exact TH19 per-level costs and upgrade times for all 6 heroes (BK 115, AQ 115, MP 100, GW 90, RC 60, DD 30).
3. **Magic Item & CWL Medal Optimizer** — Live break-even calculator comparing Hammer of Building vs Builder Potions vs Books across your active builders, Gold Pass boost, and Hammer Jam.
4. **Equip & Ores** — Full 6-hero equipment upgrade tracker for Shiny, Glowy, and Starry Ore.
5. **Wall Calc** — Exact Level 1–20 wall costs and TH2–TH19 wall counts (350 walls at TH19).
6. **Gem Calc** — Instant gem cost breakdown for remaining build time and resources.
7. **Farming Calc** — Raid loot and hourly farming efficiency planner.
8. **Base Maxing Guide** — Prioritized upgrade roadmap for Town Hall 19.

## Automated Backend Data Sync (Zero-Maintenance Updates)
ClashForge updates itself automatically whenever Supercell releases a new Town Hall, hero level, or event schedule using two layers:

1. **Live Vercel Edge API (`/api/gamedata.js`)**:
   - Fetches latest game caps from ClashKing (`assets.clashk.ing/static_data.json`) and live Raid Weekend / Season dates (`api.clashk.ing/v2/dates`).
   - Cached at Vercel's Edge CDN for 6 hours (`s-maxage=21600`) with automatic fallback to `data/gamedata.json`.
   - Works out of the box on Vercel with **zero extra environment variables**.

2. **Weekly GitHub Actions Workflow (`.github/workflows/sync-coc-data.yml`)**:
   - Runs every Monday at `06:00 UTC` (or anytime via **Actions → Run workflow**).
   - Runs `scripts/sync-coc-data.mjs`, validates that Town Hall and hero levels never shrink, and commits `data/gamedata.json` automatically only when Supercell ships new levels — triggering Vercel to auto-redeploy.

## Player Tag Sync Setup (Vercel)
Add these Environment Variables in **Vercel → Project Settings → Environment Variables**:
- `COC_API_KEY`: Your official token from [developer.clashofclans.com](https://developer.clashofclans.com/) (whitelist RoyaleAPI proxy IP `45.79.218.79`).
- `COC_PROXY_URL`: `https://cocproxy.royaleapi.dev/v1` (plain URL only, no markdown brackets).

## License & Disclaimer
This material is unofficial and is not endorsed by Supercell.
