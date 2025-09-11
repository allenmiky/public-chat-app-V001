import { useState } from "react"
import Login from "./login.jsx"
import Chat from "./Chat.jsx"


function App() {
  const [user, setUser] = useState(null)

  return (
    <div>
      {!user ? (
        <Login onLogin={(username) => setUser(username)} />
      ) : (
        <Chat username={user} />
      )}
    </div>
  )
}

export default App
