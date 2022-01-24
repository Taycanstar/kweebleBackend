const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
 
  gradeName: {
    type: String,
    required: true,
  },
  grade: {
    type: String
  },
});



module.exports = gradeSchema