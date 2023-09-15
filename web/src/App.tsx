import { Route, Switch } from "wouter";
import { Admin, Updates } from "./pages";

export function App() {
  console.debug("Rendering App");

  return (
    <div className="app">
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route component={Updates} />
      </Switch>
    </div>
  );
}
