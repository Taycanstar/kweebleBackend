const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = require("./Product").schema;
const eventSchema = require("./Event").schema;
const messageSchema = require("./Message").schema;

const scopeSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  info: {
    type: String,
  },
  photo: {
    type: String,
  },
  membership: {
    type: String,
    required: true,
  },
  isScope: {
    type: Boolean,
  },
  messages: [messageSchema],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Scope = mongoose.model("Scope", scopeSchema);

module.exports = Scope;
