import { Helmet } from "react-helmet";
import { Link } from "wouter";

export function NotFound() {
  console.debug("Rendering page NotFound");

  return (
    <>
      <Helmet>
        <title>Not Found</title>
      </Helmet>
      <header className="container">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <h2>Not found</h2>
        </hgroup>
      </header>
      <main className="container">Oopsie</main>
      <footer className="container">
        <Link href="/">Go to site</Link>
      </footer>
    </>
  );
}
