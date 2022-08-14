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
  mesages: [
    {
      type: [mongoose.Schema.Types.ObjectId],
    },
  ],
  admins: [
     admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ],
  members: [
   member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
