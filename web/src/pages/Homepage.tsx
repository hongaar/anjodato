import { limit, orderBy } from "firebase/firestore";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
import { Update } from "../components/Blog";
import { useCollection, useQueryOnce } from "../hooks";

export function Homepage() {
  console.debug("Rendering page Homepage");

  const [updates] = useQueryOnce(
    [Collection.Updates],
    orderBy("date.start", "desc"),
    limit(1),
  );
  const likes = useCollection(Collection.Likes);

  return (
    <>
      <Helmet>
        <title>Homepage</title>
      </Helmet>
      <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Homepage</p>
        </hgroup>
      </header>
      <nav className="homepage">
        <Link href="/blog">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a role="button">✍️ Blog</a>
        </Link>
        <Link href="/kaart">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a role="button">🗺️ Kaart</a>
        </Link>
      </nav>
      <main className="container-fluid homepage">
        <p className="text-center">Laatste bericht</p>
        {updates === null ? (
          <article>
            <p aria-busy="true">Berichten laden...</p>
          </article>
        ) : updates.length > 0 ? (
          <>
            {updates.map((update) => (
              <Update update={update} likes={likes} key={update.id} />
            ))}
            <p className="text-center">
              <Link role="button" href="/blog">
                ✍️ Naar het blog
              </Link>
            </p>
          </>
        ) : (
          <article>
            <p>Geen berichten</p>
          </article>
        )}
      </main>
      <footer className="container-fluid">
        <div className="text-right">
          <Link href="/admin">𝜋</Link>
        </div>
      </footer>
    </>
  );
}
