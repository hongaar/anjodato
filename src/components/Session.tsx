import { useState } from "react"
import { useSession } from "../hooks"

export function Session() {
  console.debug("Rendering Session")

  const { name, start, end } = useSession()
  const [username, setUsername] = useState("")

  return (
    <div className="session">
      {name ? (
        <div>
          <button onClick={end}>Leave race</button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            start(username)
          }}
        >
          <input
            type="text"
            placeholder="Player name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Join race</button>
        </form>
      )}
    </div>
  )
}
