const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  name: {
    type: String,
  },
  message: {
    type: String
  },
  timestamp: {
    type: String
  }

});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
