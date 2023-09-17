import { Helmet } from "react-helmet";
import { Route, Switch } from "wouter";
import { Admin, NotFound, Updates } from "./pages";

export function App() {
  console.debug("Rendering App");

  return (
    <>
      <Helmet titleTemplate="%s | AnJoDaTo" />
      <Switch>
        <Route path="/admin/:sub*" component={Admin} />
        <Route path="/" component={Updates} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
