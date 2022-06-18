const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: String,
    required: true
  },
  eventTime: {
    type: String
  },
  eventImage: {
    type: String
  },
  eventDescription: {
    type:String
  },
  eventHost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  { timestamps: true }
});


const Event = mongoose.model("Event", eventSchema);

module.exports = Event;