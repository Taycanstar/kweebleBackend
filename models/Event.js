const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endDay: {
    type: String,
  },
  location: {
    type: String,
    required: true,
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
  hostName: {
    type: String,
  },
  scope: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scope",
    required: true,
  },
  users: [
    {
      id: mongoose.Schema.Types.ObjectId,
      going: Boolean,
      goingBtn: String,
      goingBtnText: String,
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
