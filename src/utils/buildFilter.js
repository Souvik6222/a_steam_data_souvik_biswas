/**
 * buildFilter.js
 * Converts a flat query-params object into a MongoDB filter document.
 * Always enforces isDeleted: false.
 *
 * Supported params:
 *   q            — full-text regex on title & description
 *   genre        — single genre or comma-separated list  → $in
 *   tag          — single tag  or comma-separated list   → $in
 *   platform     — "windows" | "mac" | "linux"
 *   developer    — exact string match
 *   publisher    — exact string match
 *   minPrice     — price.original $gte
 *   maxPrice     — price.original $lte
 *   rating       — rating $gte
 *   releaseYear  — match calendar year of release_date
 *   discount     — "true"  → discount_percent > 0
 *   multiplayer  — "true"  → isMultiplayer: true
 *   freeToPlay   — "true"  → isFreeToPlay: true
 */

/**
 * @param {object} params  — raw req.query (all values are strings)
 * @returns {object}       — MongoDB filter object
 */
const buildFilter = (params = {}) => {
  const filter = { isDeleted: false };

  const {
    q,
    genre,
    tag,
    platform,
    developer,
    publisher,
    minPrice,
    maxPrice,
    rating,
    releaseYear,
    discount,
    multiplayer,
    freeToPlay,
  } = params;

  // ── Full-text search ────────────────────────────────────────────────────────
  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  // ── Genre ($in) ─────────────────────────────────────────────────────────────
  if (genre) {
    const genres = genre.split(',').map((g) => g.trim()).filter(Boolean);
    if (genres.length) filter.genres = { $in: genres };
  }

  // ── Tag ($in) ───────────────────────────────────────────────────────────────
  if (tag) {
    const tags = tag.split(',').map((t) => t.trim()).filter(Boolean);
    if (tags.length) filter.tags = { $in: tags };
  }

  // ── Platform ────────────────────────────────────────────────────────────────
  if (platform) {
    const validPlatforms = ['windows', 'mac', 'linux'];
    const p = platform.trim().toLowerCase();
    if (validPlatforms.includes(p)) {
      filter[`platforms.${p}`] = true;
    }
  }

  // ── Developer / Publisher ───────────────────────────────────────────────────
  if (developer) filter.developer = developer.trim();
  if (publisher) filter.publisher = publisher.trim();

  // ── Price range ─────────────────────────────────────────────────────────────
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter['price.original'] = {};
    if (minPrice !== undefined) filter['price.original'].$gte = Number(minPrice);
    if (maxPrice !== undefined) filter['price.original'].$lte = Number(maxPrice);
  }

  // ── Rating ($gte) ───────────────────────────────────────────────────────────
  if (rating !== undefined) {
    filter.rating = { $gte: Number(rating) };
  }

  // ── Release year ────────────────────────────────────────────────────────────
  if (releaseYear) {
    const year = parseInt(releaseYear, 10);
    if (!isNaN(year)) {
      filter.release_date = {
        $gte: new Date(`${year}-01-01`),
        $lt:  new Date(`${year + 1}-01-01`),
      };
    }
  }

  // ── Boolean flags ───────────────────────────────────────────────────────────
  if (discount === 'true')    filter['price.discount_percent'] = { $gt: 0 };
  if (multiplayer === 'true') filter.isMultiplayer = true;
  if (freeToPlay === 'true')  filter.isFreeToPlay  = true;

  return filter;
};

export default buildFilter;
