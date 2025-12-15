import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");
const notificationSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3");
const mentionSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3");
const sendSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3");

function CyberpunkChat({ user }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize sounds with volume
  useEffect(() => {
    [notificationSound, mentionSound, sendSound].forEach(sound => {
      sound.volume = 0.3;
    });
  }, []);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 50);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Pulse effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(!pulse);
    }, 2000);
    return () => clearInterval(interval);
  }, [pulse]);

  // Socket listeners
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);

      if (!isMuted && data.user.username !== user.username) {
        if (data.mentions && data.mentions.includes(user.username)) {
          mentionSound.currentTime = 0;
          mentionSound.play();
        } else {
          notificationSound.currentTime = 0;
          notificationSound.play();
        }
      }
    });

    socket.on("userConnected", (username) => {
      setOnlineUsers(prev => [...prev, username]);
    });

    socket.on("userDisconnected", (username) => {
      setOnlineUsers(prev => prev.filter(u => u !== username));
    });

    socket.on("typing", ({ username, isTyping: typing }) => {
      if (typing && username !== user.username) {
        setTypingUsers(prev => [...new Set([...prev, username])]);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== username));
      }
    });

    socket.on("userList", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userConnected");
      socket.off("userDisconnected");
      socket.off("typing");
      socket.off("userList");
    };
  }, [isMuted, user.username]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim()) {
      socket.emit("typing", { username: user.username, isTyping: true });
      setIsTyping(true);
    } else {
      socket.emit("typing", { username: user.username, isTyping: false });
      setIsTyping(false);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { username: user.username, isTyping: false });
      setIsTyping(false);
    }, 1000);
  }, [message, user.username]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    sendSound.currentTime = 0;
    sendSound.play();

    const mentionedUsers = [];
    const regex = /@(\w+)/g;
    let match;
    while ((match = regex.exec(message)) !== null) {
      mentionedUsers.push(match[1]);
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { 
      user, 
      text: message, 
      mentions: mentionedUsers, 
      file,
      timestamp,
      id: Date.now() + Math.random()
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        newMsg.file = reader.result;
        newMsg.fileType = file.type;
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

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const renderMessageContent = (msg) => {
    if (!msg.text) return null;
    
    return msg.text.split(" ").map((word, index) => {
      if (word.startsWith("@") && msg.mentions?.includes(word.substring(1))) {
        const mentionedUser = word.substring(1);
        const userColor = messages.find(m => m.user?.username === mentionedUser)?.user?.color || "#15fa00";
        
        return (
          <span 
            key={index} 
            style={{ 
              color: userColor, 
              fontWeight: "bold",
              textShadow: `0 0 5px ${userColor}`,
              background: "rgba(0,0,0,0.3)",
              padding: "2px 5px",
              borderRadius: "3px"
            }}
          >
            {word}{" "}
          </span>
        );
      }
      return word + " ";
    });
  };

  const cyberpunkStyles = {
    container: {
      position: 'relative',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: user.color || '#15fa00',
      fontFamily: "'Courier New', monospace",
      minHeight: '100vh',
      padding: '20px',
      border: `2px solid ${user.color || '#15fa00'}`,
      boxShadow: `0 0 30px ${user.color || '#15fa00'}33`,
      overflow: 'hidden'
    },
    glitchOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent 50%, rgba(255,0,255,0.05) 50%)',
      backgroundSize: '5px 5px',
      opacity: 0.1,
      pointerEvents: 'none'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      position: 'relative'
    },
    title: {
      fontSize: '2.5em',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      textShadow: `0 0 15px ${user.color || '#15fa00'}`,
      marginBottom: '10px',
      transform: glitchEffect ? 'translate(2px, 1px)' : 'translate(0, 0)',
      transition: 'transform 0.05s'
    },
    subtitle: {
      fontSize: '0.8em',
      color: '#888',
      letterSpacing: '2px',
      marginBottom: '20px'
    },
    userInfo: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 20px',
      background: 'rgba(0,0,0,0.7)',
      border: `1px solid ${user.color || '#15fa00'}`,
      borderRadius: '5px',
      marginBottom: '20px'
    },
    profilePic: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: `2px solid ${user.color || '#15fa00'}`,
      boxShadow: `0 0 10px ${user.color || '#15fa00'}`
    },
    chatContainer: {
      display: 'flex',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sidebar: {
      flex: '0 0 250px',
      background: 'rgba(10, 10, 20, 0.8)',
      border: `1px solid ${user.color || '#15fa00'}`,
      borderRadius: '5px',
      padding: '20px',
      backdropFilter: 'blur(5px)'
    },
    sidebarTitle: {
      fontSize: '1.2em',
      marginBottom: '15px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      borderBottom: `1px solid ${user.color || '#15fa00'}`,
      paddingBottom: '10px'
    },
    onlineUser: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px',
      marginBottom: '5px',
      borderRadius: '3px',
      background: 'rgba(0,0,0,0.3)',
      transition: 'all 0.3s'
    },
    userDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#0f0',
      boxShadow: '0 0 5px #0f0',
      animation: pulse ? 'pulse 1s infinite' : 'none'
    },
    chatBox: {
      flex: 1,
      background: 'rgba(10, 10, 20, 0.8)',
      border: `1px solid ${user.color || '#15fa00'}`,
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(5px)'
    },
    messagesContainer: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
      maxHeight: '500px',
      background: 'rgba(0,0,0,0.3)'
    },
    messageBubble: {
      marginBottom: '15px',
      padding: '12px 15px',
      background: 'rgba(0, 0, 0, 0.5)',
      borderLeft: `3px solid ${user.color || '#15fa00'}`,
      borderRadius: '0 5px 5px 0',
      position: 'relative'
    },
    messageHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '5px'
    },
    messageTime: {
      fontSize: '0.7em',
      color: '#888',
      marginLeft: 'auto'
    },
    filePreview: {
      marginTop: '10px',
      padding: '10px',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '5px',
      border: `1px dashed ${user.color || '#15fa00'}`
    },
    typingIndicator: {
      padding: '10px',
      fontStyle: 'italic',
      color: '#888',
      fontSize: '0.9em'
    },
    inputContainer: {
      padding: '20px',
      borderTop: `1px solid ${user.color || '#15fa00'}`,
      background: 'rgba(0,0,0,0.5)'
    },
    inputForm: {
      display: 'flex',
      gap: '10px'
    },
    messageInput: {
      flex: 1,
      padding: '12px 15px',
      background: 'rgba(0, 0, 0, 0.7)',
      border: `1px solid ${user.color || '#15fa00'}`,
      color: user.color || '#15fa00',
      fontSize: '14px',
      fontFamily: "'Courier New', monospace",
      outline: 'none',
      transition: 'all 0.3s',
      boxShadow: `inset 0 0 10px ${user.color || '#15fa00'}22`
    },
    fileButton: {
      padding: '12px 20px',
      background: 'rgba(0, 0, 0, 0.7)',
      border: `1px solid ${user.color || '#15fa00'}`,
      color: user.color || '#15fa00',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontFamily: "'Courier New', monospace",
      textTransform: 'uppercase',
      fontSize: '12px',
      letterSpacing: '1px'
    },
    sendButton: {
      padding: '12px 25px',
      background: `linear-gradient(45deg, #000, ${user.color || '#15fa00'}22)`,
      border: `2px solid ${user.color || '#15fa00'}`,
      color: user.color || '#15fa00',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontFamily: "'Courier New', monospace",
      textTransform: 'uppercase',
      fontWeight: 'bold',
      letterSpacing: '2px',
      textShadow: `0 0 5px ${user.color || '#15fa00'}`
    },
    muteButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '8px 15px',
      background: 'rgba(0,0,0,0.7)',
      border: `1px solid ${user.color || '#15fa00'}`,
      color: user.color || '#15fa00',
      cursor: 'pointer',
      fontFamily: "'Courier New', monospace",
      textTransform: 'uppercase',
      fontSize: '12px',
      letterSpacing: '1px',
      transition: 'all 0.3s'
    },
    fileInput: {
      display: 'none'
    }
  };

  return (
    <div style={cyberpunkStyles.container}>
      <div style={cyberpunkStyles.glitchOverlay} />
      
      <div style={cyberpunkStyles.header}>
        <h1 style={cyberpunkStyles.title}>NEURAL LINK CHAT HUB</h1>
        <div style={cyberpunkStyles.subtitle}>SECURE ENCRYPTED COMMUNICATION CHANNEL</div>
        
        <div style={cyberpunkStyles.userInfo}>
          {user.profilePic && (
            <img 
              src={user.profilePic} 
              alt="Profile" 
              style={cyberpunkStyles.profilePic}
            />
          )}
          <div>
            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
            <div style={{ fontSize: '0.8em', color: '#888' }}>ONLINE</div>
          </div>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: '#0f0',
            boxShadow: '0 0 10px #0f0',
            marginLeft: '10px'
          }} />
        </div>
      </div>

      <button
        style={cyberpunkStyles.muteButton}
        onClick={() => setIsMuted(!isMuted)}
        onMouseEnter={(e) => e.target.style.boxShadow = `0 0 15px ${user.color || '#15fa00'}`}
        onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
      >
        {isMuted ? '🔇 AUDIO MUTED' : '🔊 AUDIO ACTIVE'}
      </button>

      <div style={cyberpunkStyles.chatContainer}>
        <div style={cyberpunkStyles.sidebar}>
          <div style={cyberpunkStyles.sidebarTitle}>ACTIVE NODES</div>
          {onlineUsers.map((username, index) => (
            <div key={index} style={cyberpunkStyles.onlineUser}>
              <div style={cyberpunkStyles.userDot} />
              <span>{username}</span>
              {username === user.username && (
                <span style={{ fontSize: '0.7em', color: '#888', marginLeft: 'auto' }}>YOU</span>
              )}
            </div>
          ))}
          
          {typingUsers.length > 0 && (
            <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#888' }}>
              TYPING: {typingUsers.join(', ')}
            </div>
          )}
        </div>

        <div style={cyberpunkStyles.chatBox}>
          <div style={cyberpunkStyles.messagesContainer}>
            {messages.map((msg) => (
              <div key={msg.id} style={cyberpunkStyles.messageBubble}>
                <div style={cyberpunkStyles.messageHeader}>
                  {msg.user?.profilePic && (
                    <img
                      src={msg.user.profilePic}
                      alt="profile"
                      style={{
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        border: `1px solid ${msg.user.color || user.color || '#15fa00'}`,
                      }}
                    />
                  )}
                  <b style={{ 
                    color: msg.user?.color || user.color || '#15fa00',
                    textShadow: `0 0 5px ${msg.user?.color || user.color || '#15fa00'}`
                  }}>
                    {msg.user?.username}:
                  </b>
                  <span style={cyberpunkStyles.messageTime}>
                    {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div style={{ color: '#fff' }}>
                  {renderMessageContent(msg)}
                </div>

                {msg.file && (
                  <div style={cyberpunkStyles.filePreview}>
                    {msg.fileType?.startsWith('image/') ? (
                      <img 
                        src={msg.file} 
                        alt="Uploaded" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '3px' }}
                      />
                    ) : msg.fileType?.startsWith('video/') ? (
                      <video 
                        src={msg.file} 
                        controls 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '3px' }}
                      />
                    ) : (
                      <div style={{ color: '#888' }}>[File Attached]</div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div style={cyberpunkStyles.typingIndicator}>
                <span style={{ color: user.color || '#15fa00' }}>{user.username}</span> is typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div style={cyberpunkStyles.inputContainer}>
            <form onSubmit={handleSend} style={cyberpunkStyles.inputForm}>
              <input
                type="text"
                placeholder="TRANSMIT MESSAGE..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={cyberpunkStyles.messageInput}
                onFocus={() => sendSound.play()}
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                style={cyberpunkStyles.fileInput}
              />
              
              <button
                type="button"
                onClick={handleFileClick}
                style={cyberpunkStyles.fileButton}
                onMouseEnter={(e) => e.target.style.boxShadow = `0 0 15px ${user.color || '#15fa00'}`}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
              >
                UPLOAD
              </button>
              
              <button
                type="submit"
                style={cyberpunkStyles.sendButton}
                onMouseEnter={(e) => {
                  e.target.style.background = `linear-gradient(45deg, #000, ${user.color || '#15fa00'})`;
                  e.target.style.boxShadow = `0 0 20px ${user.color || '#15fa00'}`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = `linear-gradient(45deg, #000, ${user.color || '#15fa00'}22)`;
                  e.target.style.boxShadow = 'none';
                }}
              >
                TRANSMIT
              </button>
            </form>
            
            {file && (
              <div style={{ 
                marginTop: '10px', 
                fontSize: '0.8em', 
                color: '#888',
                padding: '5px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '3px'
              }}>
                File ready: {file.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.7em',
        color: '#666',
        letterSpacing: '1px'
      }}>
        ENCRYPTION: AES-256 | CHANNEL: SECURE | SERVER: NEURAL-HUB-01
      </div>
    </div>
  );
}

export default CyberpunkChat;