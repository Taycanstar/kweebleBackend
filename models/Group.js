const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = require("./User");
const messageSchema = require("./Message");

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  isGroup: {
    type: Boolean,
  },
  photo: {
    type: String,
  },
  description: {
    type: String,
  },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
