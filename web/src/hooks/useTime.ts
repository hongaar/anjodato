import { useEffect, useState } from "react"

export const useTime = () => {
  const [now, setNow] = useState(getTime())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(getTime()), 1000)

    return () => clearInterval(intervalId)
  }, [setNow])

  return now
}

const getTime = () => {
  return new Date()
}
