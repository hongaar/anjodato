import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
import { Body, Footer, Header, Photos } from "../components/Blog";
import { useCollectionOnce } from "../hooks";

export function Blog() {
  console.debug("Rendering page Blog");

  const [updates] = useCollectionOnce(Collection.Updates);

  return (
    <>
      <Helmet>
        <title>Blog</title>
      </Helmet>
      <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Blog</p>
        </hgroup>
      </header>
      <main className="container-fluid">
        {updates && updates.length > 0 ? (
          updates
            .sort((a, b) => (a.date.start > b.date.start ? 1 : -1))
            .map((update) => (
              <article key={update.id}>
                <Header
                  title={update.description.title}
                  locationName={update.location.name}
                  locationCountry={update.location.country}
                  placeId={update.location.place_id}
                  dateStart={update.date.start}
                  dateEnd={update.date.end}
                />
                <Body text={update.description.body} />
                <Photos
                  items={update.photos.items}
                  map={`${update.location.name}, ${update.location.country}`}
                />
                <Footer updateId={update.id} />
              </article>
            ))
        ) : (
          <article>
            <p aria-busy="true">Aan het laden...</p>
          </article>
        )}
      </main>
      <footer className="container-fluid">
        <div className="center">
          <Link href="/admin">𝜋</Link>
        </div>
      </footer>
    </>
  );
}
