const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botname = "Bot Duelana 🤖";

//Run when a client connects

io.on("connect", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    //Welcome current user
    socket.emit("message", formatMessage(botname, "Welcome to duelana Chat!"));

    //Broadcast when a user connects

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} has joined the chat`)
      );

    //send users in room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    //Runs when client disconnects

    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botname, `${user.username} has left the chat`)
        );
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });

  //listen for chat message

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
});

const PORT = 5050 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Sever runnnin on port ${PORT}`);
});
