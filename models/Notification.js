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
    photo: {
      type: String,
    },
    to: {
      type: String,
    },
    time: {
      type: Date,
    },
    to: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    from: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
