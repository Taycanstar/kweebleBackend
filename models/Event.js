const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  startDay: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endDay: {
    type: String,
  },
  location: {
    {name: {
      type: String
    },
      lat: {
        type: Number
      },
    lng:{
      type: Number
    }
    }
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
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
