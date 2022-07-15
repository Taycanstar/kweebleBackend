const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  name: {
    type: String,
  },
  text: {
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
