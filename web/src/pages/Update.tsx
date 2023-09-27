import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection, updateTitle } from "../api";
import { Nav } from "../components";
import { Update as UpdateComponent } from "../components/Blog";
import { useCollection, useDocumentOnce } from "../hooks";
import { NotFound } from "./NotFound";

export function Update({ params }: { params: { id: string } }) {
  console.debug("Rendering page Update");

  const updateId = decodeURIComponent(params.id);
  const likes = useCollection(Collection.Likes);
  const update = useDocumentOnce(Collection.Updates, updateId);

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
          <UpdateComponent update={{ id: updateId, ...update }} likes={likes} />
        )}
        <p className="text-center">
          <Link href="/" role="button" className={`inline-button`}>
            ✍️ Lees verder op het blog
          </Link>
        </p>
      </main>
      <footer className="container-fluid">
        <Nav />
      </footer>
    </>
  );
}
