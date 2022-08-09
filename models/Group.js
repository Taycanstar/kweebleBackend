const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = require("./User");
const messageSchema = require("./Message");

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  groupPhoto: {
    type: String,
  },
  admin: {
    type: String,
  },
//   members: [userSchema],
//   messages: [messageSchema],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
