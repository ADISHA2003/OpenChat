const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Store user information
let users = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  // Prompt user for their username when they connect
  socket.on("set username", (username) => {
    // Make sure the username is not empty
    if (username && username.trim()) {
      users[socket.id] = username.trim(); // Store username with socket id
      io.emit("chat message", {
        username: "Server",
        message: `${username} has joined the chat.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      users[socket.id] = "Anonymous"; // Default username
    }
  });

  // Listen for incoming messages
  socket.on("chat message", (msg) => {
    const timestamp = new Date().toLocaleTimeString(); // Get the current time
    const username = users[socket.id] || "Anonymous"; // Get username (default to "Anonymous")
    io.emit("chat message", {
      username,
      message: msg,
      timestamp
    });
  });

  // Typing indicator
  socket.on("typing", () => {
    socket.broadcast.emit("typing", users[socket.id]);
  });

  // Stop typing indicator when user stops typing
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", users[socket.id]);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
    const username = users[socket.id];
    delete users[socket.id]; // Remove user from the list
    io.emit("chat message", {
      username: "Server",
      message: `${username} has left the chat.`,
      timestamp: new Date().toLocaleTimeString(),
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
