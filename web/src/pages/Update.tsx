import { orderBy } from "firebase/firestore";
import { Helmet } from "react-helmet";
import { useLocalStorage } from "usehooks-ts";
import { Link } from "wouter";
import { Collection, updateTitle } from "../api";
import { Nav } from "../components";
import { Update as UpdateComponent } from "../components/Blog";
import { useCollection, useDocumentOnce, useQueryOnce } from "../hooks";
import { NotFound } from "./NotFound";

export function Update({ params }: { params: { id: string } }) {
  console.debug("Rendering page Update");

  const updateId = decodeURIComponent(params.id);
  const likes = useCollection(Collection.Likes);
  const update = useDocumentOnce(Collection.Updates, updateId);
  const [updates] = useQueryOnce(
    [Collection.Updates],
    orderBy("date.start", "asc"),
  );
  const [sortDesc] = useLocalStorage("sortDesc", true);

  let older, newer;

  if (updates !== null && updates.length > 0) {
    const index = updates.findIndex((u) => u.id === updateId);
    if (index > 0) {
      older = updates[index - 1];
    }
    if (index < updates.length - 1) {
      newer = updates[index + 1];
    }
  }

  if (typeof update === "undefined") {
    return <NotFound />;
  }

  return (
    <>
      {update ? (
        <Helmet>
          <title>{updateTitle(update)}</title>
        </Helmet>
      ) : null}
      <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Bericht</p>
        </hgroup>
      </header>
      <main className="container-fluid">
        {update === null ? (
          <article>
            <p aria-busy="true">Bericht laden...</p>
          </article>
        ) : (
          <UpdateComponent
            permalink={false}
            update={{ id: updateId, ...update }}
            likes={likes}
          />
        )}
        <nav>
          <ul style={{ flexDirection: sortDesc ? "row" : "row-reverse" }}>
            {older ? (
              <li>
                <Link
                  role="button"
                  data-tooltip="Ouder bericht"
                  href={`/bericht/${older.id}`}
                >
                  {sortDesc ? "⬇️ " : " "}
                  {updateTitle(older)} {sortDesc ? "" : "⬆️"}
                  <br />
                  <small>
                    📍{" "}
                    {older.description.title
                      ? `${older.location.name}, ${older.location.country}`
                      : older.location.country}
                  </small>
                </Link>
              </li>
            ) : null}
            {newer ? (
              <li>
                <Link
                  role="button"
                  data-tooltip="Nieuwer bericht"
                  href={`/bericht/${newer.id}`}
                >
                  {sortDesc ? " " : "⬇️ "}
                  {updateTitle(newer)} {sortDesc ? "⬆️" : ""}
                  <br />
                  <small>
                    📍{" "}
                    {newer.description.title
                      ? `${newer.location.name}, ${newer.location.country}`
                      : newer.location.country}
                  </small>
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      </main>
      <footer className="container-fluid">
        <Nav />
      </footer>
    </>
  );
}
