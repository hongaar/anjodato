import randomcolor from "randomcolor"
import { createContext, useCallback, useEffect, useState } from "react"
import { Collection } from "../api"
import { useBeforeUnload, useCollection, useDocWriter } from "../hooks"

type Props = {
  children: React.ReactNode
}

type Context = {
  name: null | string
  start: (name: string) => void
  end: () => void
}

export const SessionContext = createContext<Context>(null as any)

export function SessionProvider({ children }: Props) {
  console.debug("Rendering SessionProvider")

  const sessions = useCollection(Collection.Sessions)
  const writeSession = useDocWriter(Collection.Sessions)
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const fromLocalStorage = sessionStorage.getItem("session")
    if (fromLocalStorage) {
      setName(fromLocalStorage)
      writeSession(fromLocalStorage, { online: true })
    }
  }, [writeSession])

  const start = useCallback(
    (name: string) => {
      sessionStorage.setItem("session", name)
      setName(name)
      if (!sessions.some((session) => session.id === name)) {
        writeSession(name, { color: randomcolor({ luminosity: "light" }) })
      }
      writeSession(name, { online: true })
    },
    [sessions, writeSession]
  )

  const end = useCallback(() => {
    if (name) {
      sessionStorage.removeItem("session")
      writeSession(name, { online: false })
    }
    setName(null)
  }, [name, writeSession])

  useBeforeUnload(() => {
    if (name) {
      writeSession(name, { online: false })
    }
  })

  return (
    <SessionContext.Provider value={{ name, start, end }}>
      {children}
    </SessionContext.Provider>
  )
}
