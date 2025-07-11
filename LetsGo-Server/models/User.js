const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true, // will store encrypted string
    },
    address: {
      type: String,
      trim: true, // will store encrypted string
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: { type: String, default: "default_avatar.png" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    passwordHistory: [String],
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
