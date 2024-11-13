// api/socket.js
import { Server } from "socket.io";

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).send("Socket.io Server is running");
  }

  // Initialize Socket.io server
  if (req.method === "POST") {
    const io = new Server(res.socket.server); // Attach Socket.IO to Vercel server
    io.on("connection", (socket) => {
      console.log("a user connected");

      // Set username
      socket.on("set username", (username) => {
        if (username && username.trim()) {
          users[socket.id] = username.trim();
          io.emit("chat message", {
            username: "Server",
            message: `${username} has joined the chat.`,
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          users[socket.id] = "Anonymous";
        }
      });

      // Handle incoming chat messages
      socket.on("chat message", (msg) => {
        const timestamp = new Date().toLocaleTimeString();
        const username = users[socket.id] || "Anonymous";
        io.emit("chat message", {
          username,
          message: msg,
          timestamp,
        });
      });

      // Handle typing indicator
      socket.on("typing", () => {
        socket.broadcast.emit("typing", users[socket.id]);
      });

      socket.on("stop typing", () => {
        socket.broadcast.emit("stop typing", users[socket.id]);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        const username = users[socket.id];
        delete users[socket.id];
        io.emit("chat message", {
          username: "Server",
          message: `${username} has left the chat.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      });
    });
  }
}
