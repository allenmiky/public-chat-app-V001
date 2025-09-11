

import { useState } from "react"
import Login from "./Login.jsx";
import Chat from "./Chat.jsx"

function App() {
  const [user, setUser] = useState(null)

  return (
    <div>
      {!user ? (
        <Login onLogin={(userData) => setUser(userData)} />  // userData = {username, profilePic, color}
      ) : (
        <Chat user={user} />  // pass the whole object
      )}
    </div>
  )
}

export default App
