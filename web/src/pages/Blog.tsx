import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
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
                <header>
                  <hgroup>
                    <h3>
                      {update.description.title
                        ? update.description.title
                        : `${update.location.name}, ${update.location.country}`}
                    </h3>
                    <p>
                      {format(new Date(update.date.start), "d LLLL y", {
                        locale: nl,
                      })}
                      {update.description.title
                        ? ` — ${update.location.name}, ${update.location.country}`
                        : null}
                    </p>
                  </hgroup>
                </header>
                {update.description.body ? (
                  <section>{update.description.body}</section>
                ) : null}
                {update.photos.items.length ? (
                  <section>
                    {update.photos.items.map((photo) => (
                      <img
                        key={photo.id}
                        src={`${photo.image_url}=h100`}
                        alt=""
                      />
                    ))}
                  </section>
                ) : null}
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
