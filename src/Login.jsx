import { useState } from "react"

function Login({ onLogin }) {
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState("#15fa00"); // default green

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === "" || password.trim() === "") {
      alert("Please enter username & password");
      return;
    }
    // send username + profilePic + color
    onLogin({ username, profilePic, color });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePic(URL.createObjectURL(e.target.files[0]))}
        />
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value.slice(0,7))} // ensures #RRGGBB format
        />
        <br /><br />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login
