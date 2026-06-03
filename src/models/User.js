// Import mongoose to structure our MongoDB documents and interact with the database
import mongoose from 'mongoose';
// Import bcryptjs for hashing passwords and comparing hashed passwords securely
import bcrypt from 'bcryptjs';

// Define the schema for the User collection using mongoose.Schema
const userSchema = new mongoose.Schema(
  {
    // The user's name field
    name: {
      type: String, // Data type is String
      required: [true, 'Name is required'], // Field is mandatory, customized validation message if omitted
      trim: true, // Automatically removes leading and trailing white spaces from the string
    },

    // The user's email address, used for authentication
    email: {
      type: String, // Data type is String
      required: [true, 'Email is required'], // Mandatory field
      unique: true, // Creates a unique index in MongoDB so no two users can share an email
      lowercase: true, // Automatically normalizes and converts the email to lowercase
      trim: true, // Trims leading/trailing whitespace
    },

    // Hashed password field
    password: {
      type: String, // Data type is String
      required: [true, 'Password is required'], // Mandatory field
      minlength: [6, 'Password must be at least 6 characters'], // Enforces minimum string length of 6 characters
    },

    // Role-based access control field
    role: {
      type: String, // Data type is String
      enum: ['user', 'admin'], // Limits values to only 'user' or 'admin'
      default: 'user', // Defaults to 'user' if not explicitly defined
    },

    // Alternate flag for admin permissions (legacy support/easy checks)
    isAdmin: {
      type: Boolean, // Data type is Boolean
      default: false, // Defaults to false
    },

    // Verification status flag
    isVerified: {
      type: Boolean, // Data type is Boolean
      default: false, // Defaults to false
    },

    // String token used during reset password process
    resetPasswordToken: {
      type: String, // Data type is String
      default: undefined, // Defaults to undefined (does not exist on new records)
    },

    // Expiration timestamp for the reset password token
    resetPasswordExpiry: {
      type: Date, // Data type is Date
      default: undefined, // Defaults to undefined
    },

    // OTP Code used for secondary verification processes
    otpCode: {
      type: String, // Data type is String
      default: undefined, // Defaults to undefined
    },

    // Expiration timestamp for the OTP code
    otpExpiry: {
      type: Date, // Data type is Date
      default: undefined, // Defaults to undefined
    },
  },
  {
    // Automatically injects 'createdAt' and 'updatedAt' timestamps into the document
    timestamps: true,
  }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
// Pre-save middleware hook (uses userSchema.pre('save', ...))
// This runs automatically before a User document is written/saved to the database.
// Needs to be a traditional function (not arrow function) because we need the 'this' keyword to point to the current document being saved.
userSchema.pre('save', async function () {
  // If the password field hasn't been modified (e.g. updating name/email only), skip hashing to avoid double-hashing
  if (!this.isModified('password')) return;

  // Generate a cryptographically secure salt using bcrypt with a work factor of 10
  const salt = await bcrypt.genSalt(10);
  // Hash the plain text password with the generated salt and overwrite the plain text with the secure hash
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ──────────────────────────────────────────────────────────
// These methods are available on individual user document instances (e.g., const user = await User.findOne(...); user.comparePassword(...))

/**
 * Compare a plain-text candidate password against the stored hashed password.
 * @param {string} candidatePassword - The plain-text password to verify.
 * @returns {Promise<boolean>} Resolves to true if passwords match.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Use bcrypt.compare to securely compare the candidate password with the hashed password ('this.password')
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Compare a plain-text entered password against the stored hashed password.
 * (This is a duplicate method matching legacy code/different calls in the codebase)
 * @param {string} enteredPassword - The plain-text password to verify.
 * @returns {Promise<boolean>} Resolves to true if passwords match.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Use bcrypt.compare to check entered password with the hashed password ('this.password')
  return bcrypt.compare(enteredPassword, this.password);
};

// Check if mongoose already has the User model compiled to prevent Re-compilation errors in hot-reloads, otherwise compile it
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Export the User model as the default export
export default User;
