import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
import { useCollectionOnce } from "../hooks";

export function Map() {
  console.debug("Rendering page Map");

  const [updates] = useCollectionOnce(Collection.Updates);

  const currentUpdates =
    updates === null
      ? null
      : updates.sort((a, b) => (a.date.start > b.date.start ? 1 : -1));

  return (
    <>
      <Helmet>
        <title>Kaart</title>
      </Helmet>
      <header className="container-fluid">
        <hgroup>
          <Link href="/">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <h1>AnJoDaTo</h1>
            </a>
          </Link>
          <p>Kaart</p>
        </hgroup>
      </header>
      <main className="container-fluid">
        <div className="grid">
          {currentUpdates === null ? (
            <p aria-busy="true">Berichten laden...</p>
          ) : currentUpdates.length > 0 ? (
            // <iframe
            //   title="Kaart"
            //   className="map"
            //   width="600"
            //   height="450"
            //   loading="lazy"
            //   allowFullScreen
            //   referrerPolicy="no-referrer-when-downgrade"
            //   src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_API_KEY}&q=Space+Needle,Seattle+WA`}
            // ></iframe>
            <p>Wordt aan gewerkt...</p>
          ) : (
            <p>Geen berichten</p>
          )}
        </div>
      </main>
      <footer className="container-fluid">
        <nav>
          <ul>
            <li>
              <Link href="/blog">✍️ Naar het blog</Link>
            </li>
          </ul>
        </nav>
        <div className="text-right">
          <Link href="/admin">𝜋</Link>
        </div>
      </footer>
    </>
  );
}
