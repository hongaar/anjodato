// https://web.dev/wake-lock/
export function initWakelock() {
  // @ts-ignore
  if ("WakeLock" in window && "request" in window.WakeLock) {
    let wakeLock: any = null

    const requestWakeLock = () => {
      const controller = new AbortController()
      const signal = controller.signal
      // @ts-ignore
      window.WakeLock.request("screen", { signal }).catch((e: any) => {
        if (e.name === "AbortError") {
          console.log("Wake Lock was aborted")
        } else {
          console.error(`${e.name}, ${e.message}`)
        }
      })
      console.log("Wake Lock is active")
      return controller
    }

    wakeLock = requestWakeLock()

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        wakeLock = requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("fullscreenchange", handleVisibilityChange)
    // @ts-ignore
  } else if ("wakeLock" in navigator && "request" in navigator.wakeLock) {
    let wakeLock: any = null

    const requestWakeLock = async () => {
      try {
        // @ts-ignore
        wakeLock = await navigator.wakeLock.request("screen")
        wakeLock.addEventListener("release", (e: any) => {
          console.log(e)
          console.log("Wake Lock was released")
        })
        console.log("Wake Lock is active")
      } catch (e: any) {
        console.error(`${e.name}, ${e.message}`)
      }
    }

    requestWakeLock()

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("fullscreenchange", handleVisibilityChange)
  } else {
    console.error("Wake Lock API not supported.")
  }
}
