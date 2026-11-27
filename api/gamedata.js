import fs from 'fs';
import path from 'path';

const STATIC_DATA_URLS = [
  'https://assets.clashk.ing/static_data.json',
  'https://raw.githubusercontent.com/ClashKingInc/ClashKingAssets/main/static_data.json'
];
const DATES_URL = 'https://api.clashk.ing/v2/dates';

const HERO_NAME_MAP = {
  'Barbarian King': 'bk',
  'Archer Queen': 'aq',
  'Minion Prince': 'mp',
  'Grand Warden': 'gw',
  'Royal Champion': 'rc',
  'Dragon Duke': 'dd'
};

function readFallback() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'gamedata.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {
      updatedAt: new Date().toISOString(),
      source: 'Built-in TH19 fallback',
      maxTownHall: 19,
      wallMaxLevel: 20,
      wallCountAtMaxTh: 350,
      heroMaxLevels: { bk: 115, aq: 115, mp: 100, gw: 90, rc: 60, dd: 30 }
    };
  }
}

function extractGameData(raw, fallback) {
  const result = {
    updatedAt: new Date().toISOString(),
    source: 'ClashKing static_data.json',
    maxTownHall: fallback.maxTownHall,
    wallMaxLevel: fallback.wallMaxLevel,
    wallCountAtMaxTh: fallback.wallCountAtMaxTh,
    heroMaxLevels: { ...fallback.heroMaxLevels }
  };

  // Detect highest Town Hall from buildings array
  if (Array.isArray(raw.buildings)) {
    const th = raw.buildings.find(b => b.name === 'Town Hall' && Array.isArray(b.levels));
    if (th && th.levels.length >= fallback.maxTownHall) {
      result.maxTownHall = th.levels.length;
    }
    const wall = raw.buildings.find(b => b.name === 'Wall' && Array.isArray(b.levels));
    if (wall && wall.levels.length >= fallback.wallMaxLevel) {
      result.wallMaxLevel = wall.levels.length;
    }
  }

  // Detect latest Hero max levels
  if (Array.isArray(raw.heroes)) {
    for (const hero of raw.heroes) {
      const code = HERO_NAME_MAP[hero.name];
      if (code && Array.isArray(hero.levels) && hero.levels.length >= (result.heroMaxLevels[code] || 0)) {
        result.heroMaxLevels[code] = hero.levels.length;
      }
    }
  }

  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  const fallback = readFallback();
  let parsed = null;

  for (const url of STATIC_DATA_URLS) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (r.ok) {
        const raw = await r.json();
        parsed = extractGameData(raw, fallback);
        break;
      }
    } catch {
      // Try next mirror
    }
  }

  const payload = parsed || fallback;

  // Fetch live Raid Weekend & Season End dates from ClashKing
  try {
    const dr = await fetch(DATES_URL, { signal: AbortSignal.timeout(4000) });
    if (dr.ok) {
      const dates = await dr.json();
      payload.events = {
        raidStart: dates.raid_weekend_start || dates.raidStart || null,
        raidEnd: dates.raid_weekend_end || dates.raidEnd || null,
        seasonEnd: dates.season_end || dates.seasonEnd || null
      };
    }
  } catch {
    // Frontend UTC schedule handles fallback cleanly
  }

  return res.status(200).json(payload);
}
