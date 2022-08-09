const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = require("./User");
const messageSchema = require("./Message");

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  groupPhoto: {
    type: String,
  },
  description: {
    type: String,
  },
  members: [
    {
      type: [String],
    },
  ],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
