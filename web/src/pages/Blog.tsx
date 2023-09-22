import { Helmet } from "react-helmet";
import { useLocalStorage } from "usehooks-ts";
import { Link } from "wouter";
import { Collection } from "../api";
import { Body, Footer, Header, Labels, Photos } from "../components/Blog";
import { useCollectionOnce } from "../hooks";

export function Blog({ params }: { params: { label: string } }) {
  console.debug("Rendering page Blog");

  const [sortDesc, setSortDesc] = useLocalStorage("sortDesc", true);
  const [updates] = useCollectionOnce(Collection.Updates);
  const [labels] = useCollectionOnce(Collection.Labels);

  const currentUpdates =
    updates === null
      ? null
      : updates
          .sort((a, b) =>
            a.date.start > b.date.start
              ? sortDesc
                ? -1
                : 1
              : sortDesc
              ? 1
              : -1,
          )
          .filter(
            (update) =>
              !params.label ||
              update.label?.id ===
                labels?.find((label) => label.name === params.label)?.id,
          );

  return (
    <>
      <Helmet>
        <title>Blog</title>
      </Helmet>
      <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Blog{params.label ? ` / ${params.label}` : null}</p>
        </hgroup>
      </header>
      <Labels labels={labels} activeName={params.label} />
      <main className="container-fluid">
        {currentUpdates === null ? (
          <article>
            <p aria-busy="true">Berichten laden...</p>
          </article>
        ) : currentUpdates.length > 0 ? (
          currentUpdates.map((update) => (
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
            <p>Geen berichten</p>
          </article>
        )}
      </main>
      <footer className="container-fluid">
        <div>
          <label>
            <input
              type="checkbox"
              name="sortDesc"
              checked={sortDesc}
              onChange={(e) => setSortDesc(!sortDesc)}
            />
            Nieuwste berichten eerst
          </label>
        </div>
        <div>
          <Link href="/admin">𝜋</Link>
        </div>
      </footer>
    </>
  );
}
