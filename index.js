const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");

const port = process.env.PORT || 8000;

// const server = http.createServer(app);
const server = app.listen(port);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.removeAllListeners();
  console.log("User connected => " + socket.id);

  // socket.on("EVENT")
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("User joined room " + room);
  });

  socket.on("send_message", (message) => {
    console.log("Send message", message);
    io.to(message.room).emit("new_message", {
      id: new Date().getTime(),
      ...message,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use("/auth", require("./routes/users"));
app.use("/api", require("./routes/data"));
app.use("/events", require("./routes/events"));
app.use("/messages", require("./routes/messages"));

// const pusher = new Pusher({
//   appId: "1437686",
//   key: "1a01f4a6cdee8f5ea5a3",
//   secret: "7ee2259b9b49a36b95ca",
//   cluster: "us2",
//   useTLS: true,
// });

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

// const db = mongoose.connection;

// db.once("open", () => {
//   console.log("db connected");

//   const msgCollection = db.collection("messages");
//   const changeStream = msgCollection.watch();

//   changeStream.on("change", (change) => {
//     console.log(" A change occured", change);

//     if (change.operationType === "insert") {
//       const messageDetails = change.fullDocument;
//       pusher.trigger("messages", "inserted", {
//         name: messageDetails.name,
//         text: messageDetails.text,
//         timestamp: messageDetails.timestamp,
//         received: messageDetails.received,
//       });
//     } else {
//       console.log("Error triggering pusher");
//     }
//   });
// });

mongoose.set("useFindAndModify", false);

app.get("/", (req, res) => res.status(200).send("helloo world"));

// app.listen(port, () => console.log(`listening on localhost:${port}`));
