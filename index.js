const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// app.use("/upload", require("./routes/imageUpload"));
app.use("/auth", require("./routes/users"));
app.use("/api", require("./routes/data"));
app.use("/events", require("./routes/events"));



//db config
const CONNECTION_URL =
  "mongodb+srv://dimerson:7l3QhcdYXc4H8fNG@cluster0.76ok5.mongodb.net/KweebleDatabase?retryWrites=true&w=majority";
  mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.set("useFindAndModify", false);

app.get("/", (req, res) => res.status(200).send("helloo world"));

app.listen(port, () => console.log(`listening on localhost:${port}`));
