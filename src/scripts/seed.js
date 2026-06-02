/**
 * seed.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Populates the MongoDB "games" collection from a Steam dataset JSON file.
 *
 * Usage:
 *   npm run seed                      # uses src/data/games.json (default)
 *   SEED_FILE=./my_data.json npm run seed  # custom path via env var
 *
 * Expected JSON shape (array of objects OR an object whose values are records):
 *   {
 *     "appid":         "3057270",
 *     "name":          "Seafarer's Gambit",
 *     "release_year":  "2024",
 *     "release_date":  "Jul 5, 2024",
 *     "genres":        "Action;Adventure;Indie;RPG;Strategy",
 *     "categories":    "Single-player;Family Sharing",
 *     "price":         "3.99",
 *     "recommendations": "0",
 *     "developer":     "Bouncy Rocket Studios",
 *     "publisher":     "Bouncy Rocket Studios"
 *   }
 *
 * Mapping to Game schema fields:
 *   appid          → appid (Number)
 *   name           → title (String)
 *   release_date   → release_date (Date — parsed from "Jul 5, 2024")
 *   genres         → genres (String[]) — split on ";"
 *   categories     → tags  (String[]) — split on ";"
 *   price          → price.original (Number), price.isFree (Boolean)
 *   developer      → developer
 *   publisher      → publisher
 *   recommendations→ downloads (proxy — closest numeric field available)
 *
 * Fields not in the dataset are left at their schema defaults.
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import connectDB from '../config/db.js';
import Game      from '../models/Game.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const __dirname   = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SRC = resolve(__dirname, '..', 'data', 'games.json');
const SEED_FILE   = process.env.SEED_FILE
  ? resolve(process.cwd(), process.env.SEED_FILE)
  : DEFAULT_SRC;

// Chunk size for insertMany — avoids a single massive write
const BATCH_SIZE = 500;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a semicolon-delimited string into a trimmed string array.
 * Returns [] for falsy input.
 * @param {string|undefined} str
 * @returns {string[]}
 */
const splitSemicolon = (str) =>
  str ? str.split(';').map((s) => s.trim()).filter(Boolean) : [];

/**
 * Parse a price string → Number.  "0" / "" / "Free" → 0.
 * @param {string|undefined} raw
 * @returns {number}
 */
const parsePrice = (raw) => {
  if (!raw || /free/i.test(raw)) return 0;
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
};

/**
 * Parse Steam's display date string ("Jul 5, 2024") or ISO string → Date | null.
 * @param {string|undefined} raw
 * @returns {Date|null}
 */
const parseDate = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Detect feature flags from the categories string.
 * @param {string[]} cats  - Already-split categories array
 */
const detectFeatures = (cats) => {
  const has = (keyword) =>
    cats.some((c) => c.toLowerCase().includes(keyword.toLowerCase()));

  return {
    isMultiplayer:        has('Multi-player') || has('Online Co-op') || has('Online PvP'),
    isSingleplayer:       has('Single-player'),
    isCoop:               has('Co-op') || has('Online Co-op') || has('Local Co-op'),
    hasControllerSupport: has('Full controller support') || has('Partial Controller Support'),
    isVROnly:             has('VR Only'),
  };
};

/**
 * Map one raw dataset record → a plain object matching the Game schema.
 * Returns null for records with an invalid or missing appid.
 * @param {object} raw
 * @returns {object|null}
 */
const mapRecord = (raw) => {
  const appid = parseInt(raw.appid, 10);
  if (!appid || isNaN(appid) || appid < 1) return null;

  const priceNum  = parsePrice(raw.price);
  const cats      = splitSemicolon(raw.categories);
  const genres    = splitSemicolon(raw.genres);
  const features  = detectFeatures(cats);
  const downloads = Math.max(0, parseInt(raw.recommendations, 10) || 0);

  return {
    // ── Identity
    appid,
    title:       (raw.name || '').trim() || `Game ${appid}`,
    developer:   raw.developer  || '',
    publisher:   raw.publisher  || '',
    release_date: parseDate(raw.release_date),

    // ── Classification
    genres,
    tags: cats,

    // ── Price
    price: {
      original:         priceNum,
      discounted:       priceNum,
      discount_percent: 0,
      isFree:           priceNum === 0,
    },

    // ── Metrics
    downloads,
    rating: 0, // not in dataset — left at schema default

    // ── Feature flags (derived from categories)
    ...features,
    isFreeToPlay:  priceNum === 0,

    // ── Soft delete
    isDeleted: false,
  };
};

// ── Main ──────────────────────────────────────────────────────────────────────

const seed = async () => {
  // 1. Connect to MongoDB
  await connectDB();
  console.log('');

  // 2. Read the JSON file
  let raw;
  try {
    console.log(`📂  Reading dataset from: ${SEED_FILE}`);
    raw = readFileSync(SEED_FILE, 'utf8');
  } catch (err) {
    console.error(`\n❌  Could not read seed file: ${SEED_FILE}`);
    console.error('    Place your Steam dataset JSON at src/data/games.json');
    console.error('    or set SEED_FILE=./path/to/file.json\n');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('\n❌  Failed to parse JSON:', err.message);
    process.exit(1);
  }

  // Accept both an array and an object-of-objects
  const records = Array.isArray(parsed) ? parsed : Object.values(parsed);
  console.log(`📋  Found ${records.length.toLocaleString()} raw records`);

  // 3. Map to schema
  const mapped = records.map(mapRecord).filter(Boolean);
  const skipped = records.length - mapped.length;
  console.log(`🔀  Mapped ${mapped.length.toLocaleString()} records (${skipped} skipped — missing/invalid appid)`);

  // 4. Clear existing data
  console.log('🗑️   Clearing existing games collection...');
  const { deletedCount } = await Game.deleteMany({});
  console.log(`    Removed ${deletedCount.toLocaleString()} existing documents`);

  // 5. Bulk insert in batches to avoid driver payload limits
  console.log(`⬆️   Inserting in batches of ${BATCH_SIZE}...`);
  let inserted = 0;

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const batch = mapped.slice(i, i + BATCH_SIZE);
    try {
      await Game.insertMany(batch, { ordered: false }); // ordered:false = skip dupes, continue
      inserted += batch.length;
    } catch (err) {
      // insertMany with ordered:false throws a BulkWriteError but still inserts valid docs
      const successCount = err.result?.nInserted ?? batch.length;
      inserted += successCount;
      // Only warn on truly unexpected errors (not E11000 duplicate key)
      if (err.code !== 11000) {
        console.warn(`    ⚠️  Batch ${Math.ceil(i / BATCH_SIZE) + 1} warning:`, err.message);
      }
    }

    // Progress indicator every 10 batches
    if ((i / BATCH_SIZE) % 10 === 0 && i > 0) {
      process.stdout.write(`    Progress: ${inserted.toLocaleString()} / ${mapped.length.toLocaleString()} inserted\r`);
    }
  }

  // 6. Final log
  console.log('');
  console.log(`✅  Seeded ${inserted.toLocaleString()} games successfully`);
  console.log('');

  // 7. Exit
  process.exit(0);
};

seed().catch((err) => {
  console.error('\n❌  Seeding failed:', err.message);
  process.exit(1);
});
