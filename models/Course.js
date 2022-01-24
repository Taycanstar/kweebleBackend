const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gradeSchema = require("./Grade")
const itemSchema = require("./Item")



const courseSchema = new Schema({
  course: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseGrade: {
    type: String,
  },
  items: [itemSchema]
});




const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
