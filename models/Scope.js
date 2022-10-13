const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { productSchema } = require("./Product");
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
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  products: [productSchema],
  events: [eventSchema],
  messages: [messageSchema],
});

const Scope = mongoose.model("Scope", scopeSchema);

module.exports = Scope;
