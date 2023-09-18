import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
import { Header, Photos } from "../components/Blog";
import { useCollectionOnce } from "../hooks";

export function Blog() {
  console.debug("Rendering page Blog");

  const updates = useCollectionOnce(Collection.Updates);

  return (
    <>
      <Helmet>
        <title>Blog</title>
      </Helmet>
      <header className="container">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <h2>Blog</h2>
        </hgroup>
      </header>
      <main className="container">
        {updates && updates.length > 0 ? (
          updates
            .sort((a, b) => (a.date.start > b.date.start ? 1 : -1))
            .map((update) => (
              <article key={update.id}>
                <Header
                  title={update.description.title}
                  location={`${update.location.name}, ${update.location.country}`}
                  dateStart={update.date.start}
                  dateEnd={update.date.end}
                />
                {update.description.body ? (
                  <section>{update.description.body}</section>
                ) : null}
                <Photos items={update.photos.items} />
                {/* <Link href={`/updates/${update.id}`}>Lees verder...</Link> */}
              </article>
            ))
        ) : (
          <article aria-busy="true">Aan het laden...</article>
        )}
      </main>
      <footer className="container">
        <Link href="/admin">𝜋</Link>
      </footer>
    </>
  );
}
