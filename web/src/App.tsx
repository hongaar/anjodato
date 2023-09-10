import { Route, Switch } from "wouter"
import { Session } from "./components"
import { Admin, Exercises, Workshops } from "./pages"

export function App() {
  console.debug("Rendering App")

  return (
    <div className="app">
      <Session />
      <Switch>
        <Route path="/:workshop" component={Exercises} />
        <Route path="/:workshop/admin" component={Admin} />
        <Route component={Workshops} />
      </Switch>
    </div>
  )
}
