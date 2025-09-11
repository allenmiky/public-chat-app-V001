import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // make sure backend running

function Chat({ user }) { // <-- ab 'user' object expect karega
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newMsg = { user: user, text: message, file: reader.result };
        socket.emit("sendMessage", newMsg);
        setMessage("");
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      const newMsg = { user: user, text: message };
      socket.emit("sendMessage", newMsg);
      setMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", textAlign: "center" }}>
      <h1>🌍 Public Chat</h1>

      <div
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
                style={{ width: "25px", height: "25px", borderRadius: "50%", marginRight: "5px", verticalAlign: "middle" }}
              />
            )}
            <b style={{ color: msg.user?.color || "black" }}>
              {msg.user?.username || "Unknown"}:
            </b>{" "}
            {msg.text}

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
