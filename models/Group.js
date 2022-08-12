const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = require("./User");
const messageSchema = require("./Message");

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
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
  mesages: [
    {
      type: [String],
    },
  ],
  admin: [
    {
      type: [mongoose.Schema.Types.ObjectId],
    },
    isGroup: {
        type:Boolean
    }
  ],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
