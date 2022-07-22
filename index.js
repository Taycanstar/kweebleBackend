const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");
// const socket = require("socket.io");

const port = process.env.PORT || 8000;

// const server = http.createServer(app);
const server = app.listen(port);

const io = new Server(server);

io.on("connection", (socket) => {
  // socket.removeAllListeners();
  console.log("User connected => " + socket.id);

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
    socket.removeAllListeners();
  });
});

app.use(cors());
app.use(express.json());
app.use("/auth", require("./routes/users"));
app.use("/api", require("./routes/data"));
app.use("/events", require("./routes/events"));

app.use("/messages", require("./routes/messages"));

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

// app.listen(port, () => console.log(`listening on localhost:${port}`));

// const server = app.listen(process.env.PORT, () =>
//   console.log(`Server started on ${process.env.PORT}`)
// );

// const io = socket(server, {
//   cors: {
//     origin: "http://localhost:8000",
//     credentials: true,
//   },
// });
// global.onlineUsers = new Map();
// io.on("connection", (socket) => {
//   global.chatSocket = socket;
//   socket.on("add_user", (userId) => {
//     onlineUsers.set(userId, socket.id);
//   });

//   socket.on("send_message", (data) => {
//     const sendUserSocket = onlineUsers.get(data.to);
//     if (sendUserSocket) {
//       socket.to(sendUserSocket).emit("msg_recieve", data.msg);
//     }
//   });
// });
