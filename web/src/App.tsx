import { Helmet } from "react-helmet";
import { Route, Switch } from "wouter";
import { Activity, Admin, Blog, Map, NotFound, Update } from "./pages";

export function App() {
  console.debug("Rendering App");

  return (
    <>
      <Helmet titleTemplate="%s / AnJoDaTo" />
      <Switch>
        <Route path="/admin/:sub*" component={Admin} />
        <Route path="/kaart" component={Map} />
        <Route path="/reacties" component={Activity} />
        <Route path="/:label" component={Blog} />
        <Route path="/bericht/:id" component={Update} />
        <Route path="/" component={Blog} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
