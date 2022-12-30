const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    text: {
      type: String,
    },
    type: {
      type: String,
    },
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    photo: {
      type: String,
    },

    to: {
      type: String,
    },

    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
