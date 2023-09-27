import { Helmet } from "react-helmet";
import { Route, Switch } from "wouter";
import { Admin, Blog, Map, NotFound, Popular } from "./pages";

export function App() {
  console.debug("Rendering App");

  return (
    <>
      <Helmet titleTemplate="%s / AnJoDaTo" />
      <Switch>
        <Route path="/admin/:sub*" component={Admin} />
        <Route path="/kaart" component={Map} />
        <Route path="/populair" component={Popular} />
        <Route path="/:label" component={Blog} />
        <Route path="/" component={Blog} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
