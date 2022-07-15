const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  name: {
    type: String,
  },
  message: {
    type: String,
  },
  received: {
    type: Boolean,
  },
  timestamp: {
    type: String,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
