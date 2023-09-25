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
      <nav>
        <ul>
          <li>
            <Link href="/blog" role="button">
              ✍️ Blog
            </Link>
          </li>
          <li>
            <Link href="/kaart" role="button">
              🗺️ Kaart
            </Link>
          </li>
        </ul>
      </nav>
      <main className="container-fluid homepage">
        <p className="text-center">Laatste bericht:</p>
        {updates === null ? (
          <article>
            <p aria-busy="true">Laatste bericht laden...</p>
          </article>
        ) : updates.length > 0 ? (
          <>
            {updates.map((update) => (
              <Update update={update} likes={likes} key={update.id} />
            ))}
          </>
        ) : (
          <article>
            <p>Geen berichten</p>
          </article>
        )}
      </main>
      <footer className="container-fluid">
        <nav>
          <ul>
            <li>
              <Link href="/blog">✍️ Naar het blog</Link>
            </li>
            <li>
              <Link href="/kaart">🗺️ Naar de kaart</Link>
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
