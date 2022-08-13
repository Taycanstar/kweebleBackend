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
  members: [
    {
      type: [mongoose.Schema.Types.ObjectId],
    },
  ],
  mesages: [
    {
      type: [mongoose.Schema.Types.ObjectId],
    },
  ],
  admin: [
    {
      type: [mongoose.Schema.Types.ObjectId],
    },
  ],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
