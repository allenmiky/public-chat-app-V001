

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
// const notificationSound = new Audio("/notification.mp3");
// const mentionSound = new Audio("/mention.mp3");


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend address
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("⚡ New user connected:", socket.id);
// if (!isMuted && data.user.username !== user.username) {
//     if (data.mentions.includes(user.username)) {
//         mentionSound.play();
//     } else {
//         notificationSound.play();
//     }
// }
  socket.on("sendMessage", (data) => {
    console.log("📩 Message received:", data);
    io.emit("receiveMessage", data); // broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

