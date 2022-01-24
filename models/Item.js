const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gradeSchema = require("./Grade")

const itemSchema = new Schema({
  item: {
    type: String,
  },
  percentage: {
    type: String,
    required: true,
  },
  itemGrade: {
    type: String
  },
  grades: [gradeSchema]
});


module.exports = itemSchema;
