const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = require("./Product").schema;
const eventSchema = require("./Event");
const messageSchema = require("./Message");

const scopeSchema = new Schema({
  name: {
    type: String,
  },
  details: {
    type: String,
  },
  photo: {
    type: String,
  },
  type: {
    type: String,
  },
  products: [productSchema],
  events: [eventSchema],
  messages: [messageSchema],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Scope = mongoose.model("Scope", scopeSchema);

module.exports = Scope;
