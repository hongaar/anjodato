import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";
import { Link, Route, Router } from "wouter";
import {
  Labels,
  Navigation,
  UpdatesEdit,
  UpdatesList,
} from "../components/Admin";
import { AuthProvider } from "../context";

export function Admin({ params }: { params: { workshop: string } }) {
  console.debug("Rendering page Admin");

  return (
    <AuthProvider>
      <Helmet>
        <title>Admin</title>
      </Helmet>
      <Toaster />
      <header className="container">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <h2>Admin</h2>
        </hgroup>
        <Navigation />
      </header>
      <main className="container">
        <Router base="/admin">
          <Route path="/updates/:id" component={UpdatesEdit} />
          <Route path="/updates" component={UpdatesList} />
          <Route path="/labels" component={Labels} />
        </Router>
      </main>
      <footer className="container">
        ➡️ <Link href="/">Naar het blog</Link>
      </footer>
    </AuthProvider>
  );
}
