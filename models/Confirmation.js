const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const confirmationSchema = new Schema(
  {
    email: { type: String, required: true },
    hashedPassword: { type: String },
    confirmationToken: { type: String, required: true },
  },
  { timestamps: true }
);

const Confirmation = mongoose.model("Confirmation", confirmationSchema);

module.exports = Confirmation;
