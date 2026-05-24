import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String },
  comment: { type: String },
  score: { type: Number }
});

const gameSchema = new mongoose.Schema(
  {
    appid: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: { type: String },
    developer: { type: String },
    publisher: { type: String },
    release_date: { type: Date },
    genres: {
      type: [String],
      index: true
    },
    tags: { type: [String] },
    platforms: {
      windows: { type: Boolean },
      mac: { type: Boolean },
      linux: { type: Boolean }
    },
    price: {
      original: { type: Number, index: true },
      discounted: { type: Number },
      discount_percent: { type: Number },
      isFree: { type: Boolean }
    },
    rating: {
      type: Number,
      index: true
    },
    downloads: { type: Number },
    screenshots: { type: [String] },
    trailers: { type: [String] },
    achievements: { type: [String] },
    system_requirements: { type: mongoose.Schema.Types.Mixed },
    dlc: { type: [String] },
    reviews: [reviewSchema],
    isFreeToPlay: { type: Boolean },
    isEarlyAccess: { type: Boolean },
    isVROnly: { type: Boolean },
    hasControllerSupport: { type: Boolean },
    isMultiplayer: { type: Boolean },
    isSingleplayer: { type: Boolean },
    isCoop: { type: Boolean },
    isOpenWorld: { type: Boolean },
    isSurvival: { type: Boolean },
    isHorror: { type: Boolean },
    isAnime: { type: Boolean },
    isIndie: { type: Boolean },
    isDeleted: {
      type: Boolean,
      default: false
    },
    updateHistory: { type: [mongoose.Schema.Types.Mixed] }
  },
  {
    timestamps: true
  }
);

const Game = mongoose.model('Game', gameSchema);

export default Game;
