const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    reason: {
      type: String,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedItem: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
