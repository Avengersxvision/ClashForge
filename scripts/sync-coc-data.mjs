import fs from 'fs';
import path from 'path';

const URLS = [
  'https://assets.clashk.ing/static_data.json',
  'https://raw.githubusercontent.com/ClashKingInc/ClashKingAssets/main/static_data.json'
];

const HERO_MAP = {
  'Barbarian King': 'bk',
  'Archer Queen': 'aq',
  'Minion Prince': 'mp',
  'Grand Warden': 'gw',
  'Royal Champion': 'rc',
  'Dragon Duke': 'dd'
};

const outPath = path.join(process.cwd(), 'data', 'gamedata.json');
const current = JSON.parse(fs.readFileSync(outPath, 'utf8'));

let raw = null;
for (const url of URLS) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      raw = await res.json();
      break;
    }
  } catch (err) {
    console.warn('Mirror failed:', url, err.message);
  }
}

if (!raw) {
  console.error('Could not reach ClashKing static_data.json mirrors. Keeping existing data.');
  process.exit(0);
}

const next = {
  updatedAt: new Date().toISOString(),
  source: 'ClashKingAssets (auto-synced)',
  maxTownHall: current.maxTownHall,
  wallMaxLevel: current.wallMaxLevel,
  wallCountAtMaxTh: current.wallCountAtMaxTh,
  heroMaxLevels: { ...current.heroMaxLevels }
};

if (Array.isArray(raw.buildings)) {
  const th = raw.buildings.find(b => b.name === 'Town Hall' && Array.isArray(b.levels));
  if (th && th.levels.length >= current.maxTownHall) next.maxTownHall = th.levels.length;
  const wall = raw.buildings.find(b => b.name === 'Wall' && Array.isArray(b.levels));
  if (wall && wall.levels.length >= current.wallMaxLevel) next.wallMaxLevel = wall.levels.length;
}

if (Array.isArray(raw.heroes)) {
  for (const h of raw.heroes) {
    const code = HERO_MAP[h.name];
    if (code && Array.isArray(h.levels) && h.levels.length >= (next.heroMaxLevels[code] || 0)) {
      next.heroMaxLevels[code] = h.levels.length;
    }
  }
}

// Sanity guard: never allow data to shrink
if (next.maxTownHall < current.maxTownHall) {
  console.error('Sanity check failed: maxTownHall dropped. Aborting.');
  process.exit(1);
}

const changed =
  next.maxTownHall !== current.maxTownHall ||
  next.wallMaxLevel !== current.wallMaxLevel ||
  JSON.stringify(next.heroMaxLevels) !== JSON.stringify(current.heroMaxLevels);

if (!changed) {
  console.log('No new Clash of Clans levels detected. Already up to date at TH' + current.maxTownHall);
  process.exit(0);
}

fs.writeFileSync(outPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
console.log('Updated data/gamedata.json -> TH' + next.maxTownHall, next.heroMaxLevels);
