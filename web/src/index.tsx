import React from "react"
import ReactDOM from "react-dom/client"
import { initWakelock } from "./api"
import { App } from "./App"
import { FirebaseProvider, SessionProvider } from "./context"
import "./index.scss"
import reportWebVitals from "./reportWebVitals"

initWakelock()

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </FirebaseProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
