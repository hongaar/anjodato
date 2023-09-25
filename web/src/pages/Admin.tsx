import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";
import { Link, Route, Router } from "wouter";
import {
  Comments,
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
      <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Admin</p>
        </hgroup>
        <Navigation />
      </header>
      <main className="container-fluid">
        <Router base="/admin">
          <Route path="/labels" component={Labels} />
          <Route path="/updates/:id" component={UpdatesEdit} />
          <Route path="/updates" component={UpdatesList} />
          <Route path="/comments" component={Comments} />
        </Router>
      </main>
      <footer className="container-fluid">
        <div>
          ✍️ <Link href="/blog">Naar het blog</Link>
        </div>
      </footer>
    </AuthProvider>
  );
}
