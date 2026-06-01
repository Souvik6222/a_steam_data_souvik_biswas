const mongoose = require('mongoose');

const { Schema } = mongoose;

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const PriceSchema = new Schema(
  {
    original:        { type: Number, default: 0, min: 0, index: true },
    discounted:      { type: Number, default: 0, min: 0 },
    discount_percent:{ type: Number, default: 0, min: 0, max: 100 },
    isFree:          { type: Boolean, default: false },
  },
  { _id: false }
);

const PlatformsSchema = new Schema(
  {
    windows: { type: Boolean, default: false },
    mac:     { type: Boolean, default: false },
    linux:   { type: Boolean, default: false },
  },
  { _id: false }
);

const SystemRequirementsSchema = new Schema(
  {
    minimum:     { type: String },
    recommended: { type: String },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    user:    { type: String, trim: true },
    comment: { type: String, trim: true },
    score:   { type: Number, min: 0, max: 10 },
  },
  { _id: false }
);

// ── Main schema ────────────────────────────────────────────────────────────────

const GameSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    appid: {
      type:     Number,
      required: [true, 'appid is required'],
      unique:   true,
      index:    true,
    },
    title: {
      type:     String,
      required: [true, 'title is required'],
      trim:     true,
    },
    description: { type: String, trim: true },
    developer:   { type: String, trim: true },
    publisher:   { type: String, trim: true },
    release_date:{ type: Date },

    // ── Classification ────────────────────────────────────────────────────────
    genres: { type: [String], default: [], index: true },
    tags:   { type: [String], default: [] },

    // ── Platform & price ──────────────────────────────────────────────────────
    platforms:           { type: PlatformsSchema, default: () => ({}) },
    price:               { type: PriceSchema,     default: () => ({}) },

    // ── Metrics ───────────────────────────────────────────────────────────────
    rating:    { type: Number, default: 0, min: 0, max: 10, index: true },
    downloads: { type: Number, default: 0, min: 0 },

    // ── Media ─────────────────────────────────────────────────────────────────
    screenshots: { type: [String], default: [] },
    trailers:    { type: [String], default: [] },

    // ── Game content ──────────────────────────────────────────────────────────
    achievements:        { type: [String], default: [] },
    system_requirements: { type: SystemRequirementsSchema, default: () => ({}) },
    dlc:                 { type: [String], default: [] },
    reviews:             { type: [ReviewSchema], default: [] },
    updateHistory:       { type: [String], default: [] },

    // ── Feature flags ─────────────────────────────────────────────────────────
    isFreeToPlay:         { type: Boolean, default: false },
    isEarlyAccess:        { type: Boolean, default: false },
    isVROnly:             { type: Boolean, default: false },
    hasControllerSupport: { type: Boolean, default: false },
    isMultiplayer:        { type: Boolean, default: false },
    isSingleplayer:       { type: Boolean, default: false },
    isCoop:               { type: Boolean, default: false },
    isOpenWorld:          { type: Boolean, default: false },
    isSurvival:           { type: Boolean, default: false },
    isHorror:             { type: Boolean, default: false },
    isAnime:              { type: Boolean, default: false },
    isIndie:              { type: Boolean, default: false },

    // ── Soft delete ───────────────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,          // adds createdAt & updatedAt
    versionKey: '__v',
  }
);

// ── Compound indexes ──────────────────────────────────────────────────────────
GameSchema.index({ rating: -1, 'price.original': 1 });   // sort by rating + price
GameSchema.index({ genres: 1, rating: -1 });              // genre leaderboard
GameSchema.index({ isDeleted: 1, appid: 1 });             // soft-delete aware lookups

// ── Virtual: effective price ──────────────────────────────────────────────────
GameSchema.virtual('effectivePrice').get(function () {
  return this.price?.isFree ? 0 : (this.price?.discounted ?? this.price?.original ?? 0);
});

// ── Query helper: exclude soft-deleted docs ───────────────────────────────────
GameSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Game', GameSchema);
