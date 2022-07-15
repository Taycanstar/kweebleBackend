const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Pusher = require("pusher");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// app.use("/upload", require("./routes/imageUpload"));
app.use("/auth", require("./routes/users"));
app.use("/api", require("./routes/data"));
app.use("/events", require("./routes/events"));
app.use("/messages", require("./routes/messages"));

const pusher = new Pusher({
  appId: "1437686",
  key: "1a01f4a6cdee8f5ea5a3",
  secret: "7ee2259b9b49a36b95ca",
  cluster: "us2",
  useTLS: true,
});

// pusher.trigger("my-channel", "my-event", {
//   message: "hello world",
// });

//db config
const CONNECTION_URL =
  "mongodb+srv://dimerson:7l3QhcdYXc4H8fNG@cluster0.76ok5.mongodb.net/KweebleDatabase?retryWrites=true&w=majority";
mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("db connected");

  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(" A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.user,
        message: messageDetails.message,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

mongoose.set("useFindAndModify", false);

app.get("/", (req, res) => res.status(200).send("helloo world"));

app.listen(port, () => console.log(`listening on localhost:${port}`));
