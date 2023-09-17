import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
import { useCollection } from "../hooks";

export function Updates() {
  console.debug("Rendering page Updates");

  const updates = useCollection(Collection.Updates);

  return (
    <>
      <Helmet>
        <title>Updates</title>
      </Helmet>
      <header className="container">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <h2>Updates</h2>
        </hgroup>
      </header>
      <main className="container">
        <ul>
          {updates?.map((update) => (
            <li key={update.id}>
              <Link href={`/${update.id}`}>{update.description.title}</Link>
            </li>
          ))}
        </ul>
      </main>
      <footer className="container">
        <Link href="/admin">Go to administration</Link>
      </footer>
    </>
  );
}
