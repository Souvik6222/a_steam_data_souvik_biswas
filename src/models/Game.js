// Import mongoose library to interact with MongoDB
import mongoose from 'mongoose';

// Extract the Schema constructor from mongoose for convenience
const { Schema } = mongoose;

// ── Sub-schemas ────────────────────────────────────────────────────────────────
// Sub-schemas allow nested objects within a document to have structured validation but without separate collection identities.

// Schema definition for game prices
const PriceSchema = new Schema(
  {
    // Original (base) price of the game (minimum 0, indexed for fast pricing search)
    original:        { type: Number, default: 0, min: 0, index: true },
    // Discounted price of the game (minimum 0)
    discounted:      { type: Number, default: 0, min: 0 },
    // Percentage discount value (0 to 100)
    discount_percent:{ type: Number, default: 0, min: 0, max: 100 },
    // Boolean indicator of whether the game is free
    isFree:          { type: Boolean, default: false },
  },
  { _id: false } // Disable automatic _id creation for this sub-document to save space/memory
);

// Schema definition for supported operating systems
const PlatformsSchema = new Schema(
  {
    windows: { type: Boolean, default: false },
    mac:     { type: Boolean, default: false },
    linux:   { type: Boolean, default: false },
  },
  { _id: false } // Disable automatic _id creation
);

// Schema definition for minimum and recommended PC requirements
const SystemRequirementsSchema = new Schema(
  {
    minimum:     { type: String },
    recommended: { type: String },
  },
  { _id: false } // Disable automatic _id creation
);

// Schema definition for user reviews nested inside the game document
const ReviewSchema = new Schema(
  {
    // The name/username of the reviewer
    user:    { type: String, trim: true },
    // Text content of the user review
    comment: { type: String, trim: true },
    // Score assigned by the reviewer (bounded between 0 and 10)
    score:   { type: Number, min: 0, max: 10 },
  }
  // _id intentionally enabled here so that sub-document reviews can be targeted individually for edits/deletes
);

// ── Main schema ────────────────────────────────────────────────────────────────
// The primary schema definition representing documents in the 'games' collection in MongoDB

const GameSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    // The unique Steam AppID identifying the game
    appid: {
      type:     Number,
      required: [true, 'appid is required'], // Field is mandatory
      unique:   true, // Ensures AppIDs are unique across all games
      index:    true, // Unique indexes speed up find queries by AppID
    },
    // The title of the game
    title: {
      type:     String,
      required: [true, 'title is required'], // Mandatory field
      trim:     true, // Automatically strips whitespace
    },
    // Descriptive text about the game
    description: { type: String, trim: true },
    // Studio name that developed the game
    developer:   { type: String, trim: true },
    // Company that published the game
    publisher:   { type: String, trim: true },
    // Official release date of the game
    release_date:{ type: Date },

    // ── Classification ────────────────────────────────────────────────────────
    // Array of genre categories (e.g. Action, RPG), indexed for rapid genre-based searches
    genres: { type: [String], default: [], index: true },
    // Array of tag descriptive words
    tags:   { type: [String], default: [] },

    // ── Platform & price ──────────────────────────────────────────────────────
    // Embedded platform support sub-schema
    platforms:           { type: PlatformsSchema, default: () => ({}) },
    // Embedded pricing details sub-schema
    price:               { type: PriceSchema,     default: () => ({}) },

    // ── Metrics ───────────────────────────────────────────────────────────────
    // User rating score (from 0 to 10), indexed for sorting leaderboard queries
    rating:    { type: Number, default: 0, min: 0, max: 10, index: true },
    // Number of total downloads
    downloads: { type: Number, default: 0, min: 0 },

    // ── Media ─────────────────────────────────────────────────────────────────
    // Array of image links for screenshots
    screenshots: { type: [String], default: [] },
    // Array of trailer video links
    trailers:    { type: [String], default: [] },

    // ── Game content ──────────────────────────────────────────────────────────
    // Array of achievements names
    achievements:        { type: [String], default: [] },
    // Nested PC requirements details
    system_requirements: { type: SystemRequirementsSchema, default: () => ({}) },
    // List of downloadable content appids/names
    dlc:                 { type: [String], default: [] },
    // Array of sub-document user reviews
    reviews:             { type: [ReviewSchema], default: [] },
    // Historical change log logs
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

    // ── Soft delete flag ───────────────────────────────────────────────────────
    // Soft delete allows flagging a record as deleted without purging it from the database immediately
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    // Auto-populate 'createdAt' and 'updatedAt'
    timestamps: true,
    // Specify the key used for Mongoose document versioning (defaults to __v)
    versionKey: '__v',
  }
);

// ── Compound indexes ──────────────────────────────────────────────────────────
// Compound indexes optimize queries that filter or sort by multiple properties simultaneously.

// Optimizes queries that filter or sort by rating descending, and then price original ascending
GameSchema.index({ rating: -1, 'price.original': 1 });
// Optimizes genre leaderboard pages (filtering by genre and sorting by rating descending)
GameSchema.index({ genres: 1, rating: -1 });
// Optimizes queries checking for active documents (isDeleted: false) matching specific appids
GameSchema.index({ isDeleted: 1, appid: 1 });

// ── Virtual: effective price ──────────────────────────────────────────────────
// Virtuals are properties not persisted to the DB but evaluated on the fly upon retrieval.
GameSchema.virtual('effectivePrice').get(function () {
  // If the game is free, return 0; else return discounted price, falling back to original price, defaulting to 0.
  return this.price?.isFree ? 0 : (this.price?.discounted ?? this.price?.original ?? 0);
});

// ── Query helper: exclude soft-deleted docs ───────────────────────────────────
// Extends the query chain capability of Game model so you can do Game.find().active() to retrieve non-deleted records
GameSchema.query.active = function () {
  // Adds isDeleted: false to the current query filter
  return this.where({ isDeleted: false });
};

// Export the compiled Game model
export default mongoose.model('Game', GameSchema);

