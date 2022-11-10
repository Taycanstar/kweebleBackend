const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  day: {
    type: String,
  },
  month: {
    type: String,
  },
  year: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endDay: {
    type: String,
  },
  location: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  endTime: {
    type: String,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  host: {
    type: Boolean,
  },
  datetime: {
    type: Number,
  },
  icon: {
    type: String,
  },
  scope: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scope",
  },
  users: [
    {
      id: mongoose.Schema.Types.ObjectId,
      going: String,
    },
  ],
  going: {
    type: String,
  },
  goingBtn: {
    type: String,
  },
  goingBtnText: {
    type: String,
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
