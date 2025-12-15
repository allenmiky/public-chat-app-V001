import { useState, useRef, useEffect } from "react";

function CyberpunkLogin({ onLogin }) {
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState("#15fa00");
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [hackingText, setHackingText] = useState("");
  const [scanLine, setScanLine] = useState(0);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Cyberpunk sound effects
  const playSound = (type) => {
    const audio = new Audio();
    if (type === 'click') {
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ';
    } else if (type === 'glitch') {
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ';
    }
    audio.play();
  };

  // Glitch animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 50);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scan line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Matrix rain effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!%^&*";
    const drops = [];
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    for(let i = 0; i < columns; i++) {
      drops[i] = 1;
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 10, 20, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      
      for(let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [color]);

  const handleSubmit = (e) => {
    e.preventDefault();
    playSound('click');
    
    if (username.trim() === "" || password.trim() === "") {
      setHackingText("ACCESS DENIED: CREDENTIALS REQUIRED");
      setTimeout(() => setHackingText(""), 2000);
      return;
    }
    
    // Simulate hacking sequence
    setHackingText("INITIATING SYSTEM BREACH...");
    setTimeout(() => {
      setHackingText("CREDENTIALS ACCEPTED");
      setTimeout(() => {
        onLogin({ username, profilePic, color });
        setHackingText("");
      }, 1000);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
      playSound('glitch');
    }
  };

  const cyberpunkStyles = {
    container: {
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(45deg, #0a0a0a 0%, #151515 100%)',
      color: color,
      fontFamily: "'Courier New', monospace",
      minHeight: '100vh',
      padding: '20px',
      border: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}33`
    },
    scanLine: {
      position: 'absolute',
      top: `${scanLine}%`,
      left: 0,
      width: '100%',
      height: '2px',
      background: color,
      opacity: 0.7,
      boxShadow: `0 0 10px ${color}`,
      zIndex: 1
    },
    canvas: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.3,
      zIndex: 0
    },
    glitchText: {
      position: 'relative',
      fontSize: '2.5em',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      marginBottom: '30px',
      textShadow: `0 0 10px ${color}`,
      transform: glitchEffect ? 'translate(2px, 1px)' : 'translate(0, 0)',
      transition: 'transform 0.05s'
    },
    formContainer: {
      position: 'relative',
      zIndex: 2,
      background: 'rgba(10, 10, 20, 0.8)',
      padding: '40px',
      borderRadius: '5px',
      border: `1px solid ${color}`,
      boxShadow: `0 0 30px ${color}44`,
      maxWidth: '500px',
      margin: '50px auto',
      backdropFilter: 'blur(5px)'
    },
    input: {
      width: '100%',
      padding: '15px',
      margin: '10px 0',
      background: 'rgba(0, 0, 0, 0.7)',
      border: `1px solid ${color}`,
      color: color,
      fontSize: '16px',
      fontFamily: "'Courier New', monospace",
      outline: 'none',
      transition: 'all 0.3s',
      boxShadow: `inset 0 0 10px ${color}22`
    },
    button: {
      width: '100%',
      padding: '15px',
      marginTop: '20px',
      background: 'linear-gradient(45deg, #000, #222)',
      border: `2px solid ${color}`,
      color: color,
      fontSize: '18px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontFamily: "'Courier New', monospace",
      textShadow: `0 0 5px ${color}`,
      position: 'relative',
      overflow: 'hidden'
    },
    hackingText: {
      color: '#ff0000',
      fontFamily: "'Courier New', monospace",
      fontSize: '14px',
      letterSpacing: '1px',
      textAlign: 'center',
      margin: '10px 0',
      minHeight: '20px'
    },
    colorPickerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: '15px 0'
    },
    colorLabel: {
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    fileInputLabel: {
      display: 'block',
      padding: '15px',
      margin: '10px 0',
      background: 'rgba(0, 0, 0, 0.7)',
      border: `1px dashed ${color}`,
      color: color,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontFamily: "'Courier New', monospace'",
      fontSize: '14px',
      textTransform: 'uppercase'
    },
    fileInput: {
      display: 'none'
    },
    profilePreview: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      border: `2px solid ${color}`,
      margin: '10px auto',
      overflow: 'hidden',
      boxShadow: `0 0 15px ${color}`
    }
  };

  return (
    <div style={cyberpunkStyles.container}>
      <div style={cyberpunkStyles.scanLine} />
      <canvas ref={canvasRef} style={cyberpunkStyles.canvas} />
      
      <div style={cyberpunkStyles.formContainer}>
        <h1 style={cyberpunkStyles.glitchText}>CYBER ACCESS TERMINAL</h1>
        
        <div style={cyberpunkStyles.hackingText}>
          {hackingText}
        </div>
        
        <form onSubmit={handleSubmit}>
          <label style={cyberpunkStyles.fileInputLabel}>
            UPLOAD NEURAL IMPRINT
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={cyberpunkStyles.fileInput}
            />
          </label>
          
          {profilePic && (
            <div style={cyberpunkStyles.profilePreview}>
              <img 
                src={profilePic} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
          
          <input
            type="text"
            placeholder="ENTER CODENAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={cyberpunkStyles.input}
            onFocus={() => playSound('click')}
          />
          
          <div style={cyberpunkStyles.colorPickerContainer}>
            <span style={cyberpunkStyles.colorLabel}>NEON SIGNATURE:</span>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => {
                setColor(e.target.value.slice(0,7));
                playSound('click');
              }}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ color: color, fontSize: '12px' }}>{color}</span>
          </div>
          
          <input
            type="password"
            placeholder="ENTER ENCRYPTION KEY"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={cyberpunkStyles.input}
            onFocus={() => playSound('click')}
          />
          
          <button 
            type="submit" 
            style={cyberpunkStyles.button}
            onMouseEnter={() => playSound('click')}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(45deg, #000, #222)';
              e.currentTarget.style.boxShadow = `0 0 20px ${color}`;
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = `linear-gradient(45deg, ${color}22, #000)`;
              e.currentTarget.style.boxShadow = `0 0 30px ${color}`;
            }}
          >
            INITIATE SYSTEM LINK
          </button>
        </form>
        
        <div style={{ 
          marginTop: '30px', 
          fontSize: '12px', 
          textAlign: 'center',
          color: '#888',
          letterSpacing: '1px'
        }}>
          WARNING: UNAUTHORIZED ACCESS WILL BE PROSECUTED<br />
          SYSTEM TIME: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default CyberpunkLogin;