import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");
const notificationSound = new Audio("/notification.mp3");
const mentionSound = new Audio("/mention.mp3");

function Chat({ user }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);

      if (!isMuted && data.user.username !== user.username) {
        if (data.mentions.includes(user.username)) {
          mentionSound.play();
        } else {
          notificationSound.play();
        }
      }
    });

    return () => socket.off("receiveMessage");
  }, [isMuted, user.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message && !file) return;

    const mentionedUsers = [];
    const regex = /@(\w+)/g;
    let match;
    while ((match = regex.exec(message)) !== null) {
      mentionedUsers.push(match[1]);
    }

    const newMsg = { user, text: message, mentions: mentionedUsers, file };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        newMsg.file = reader.result;
        socket.emit("sendMessage", newMsg);
        setMessage("");
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit("sendMessage", newMsg);
      setMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h1>🌍 Public Chat</h1>

      <button
        onClick={() => setIsMuted(!isMuted)}
        style={{ marginBottom: "10px", padding: "5px 10px" }}
      >
        {isMuted ? "Unmute 🔊" : "Mute 🔇"}
      </button>

      <div id="chat-box-main"
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: "left", marginBottom: "10px" }}>
            {msg.user?.profilePic && (
              <img
                src={msg.user.profilePic}
                alt="profile"
                style={{
                  width: "25px",
                  height: "25px",
                  borderRadius: "50%",
                  marginRight: "5px",
                  verticalAlign: "middle",
                }}
              />
            )}

            <b style={{ color: msg.user?.color || "black" }}>{msg.user?.username}:</b>{" "}

            {msg.text.split(" ").map((word, index) => {
              if (word.startsWith("@") && msg.mentions.includes(word.substring(1))) {
                return (
                  <span key={index} style={{ color: "blue", fontWeight: "bold" }}>
                    {word}{" "}
                  </span>
                );
              }
              return word + " ";
            })}

            {msg.file && (
              msg.file.startsWith("data:image") ? (
                <img src={msg.file} style={{ maxWidth: "100%", marginTop: "5px" }} />
              ) : msg.file.startsWith("data:video") ? (
                <video src={msg.file} controls style={{ maxWidth: "100%", marginTop: "5px" }} />
              ) : null
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "60%", padding: "8px" }}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginLeft: "5px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", marginLeft: "5px" }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
