const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    college: {
      type: String,
    },
    gender: {
      type: String,
    },

    birthDay: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    birthMonth: {
      type: String,
      required: true,
    },
    birthYear: {
      type: String,
      required: true,
    },
    gradeLevel: { type: String },
    btcAddress: { type: String },
    ethAddress: { type: String },
    dogeAddress: { type: String },

    graduationYear: { type: String },
    typeOfDegree: { type: String },

    phoneNumber: { type: String },
    major: { type: String },
    interests: { type: String },
    snapchat: { type: String },
    instagram: { type: String },
    photo: {
      type: String,
    },
    position: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    scopes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scope" }],
    savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(4).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
