import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Collection } from "../api";
import { Photos } from "../components/Blog";
import { useCollection, useCollectionOnce } from "../hooks";

export function Popular() {
  console.debug("Rendering page Popular");

  const likes = useCollection(Collection.Likes);
  const [updates] = useCollectionOnce(Collection.Updates);

  const popularPhotoItems = useMemo(() => {
    if (likes === null || updates === null) {
      return null;
    }

    const photoDimensionsMap: Map<string, { width: number; height: number }> =
      new Map();

    updates.forEach((update) => {
      update.photos.items.forEach((photo) => {
        photoDimensionsMap.set(photo.url, {
          width: photo.width,
          height: photo.height,
        });
      });
    });

    const sortedLikes = likes
      ?.sort((a, b) => {
        return b.counter - a.counter;
      })
      .map((like) => {
        return {
          url: like.url,
          width: photoDimensionsMap.get(like.url)?.width || 200,
          height: photoDimensionsMap.get(like.url)?.height || 200,
        };
      });

    return sortedLikes;
  }, [likes, updates]);

  return (
    <>
      <Helmet>
        <title>Populair</title>
      </Helmet>
      <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Populair</p>
        </hgroup>
      </header>
      <main className="container-fluid">
        {popularPhotoItems === null ? (
          <article>
            <p aria-busy="true">Foto's laden...</p>
          </article>
        ) : popularPhotoItems.length > 0 ? (
          <article>
            <Photos items={popularPhotoItems} likes={likes} />
          </article>
        ) : (
          <article>
            <p>Geen foto's</p>
          </article>
        )}
      </main>
      <footer className="container-fluid">
        <nav>
          <ul>
            <li>
              <Link href="/">✍️ Naar het blog</Link>
            </li>
            <li>
              <Link href="/kaart">🗺️ Naar de kaart</Link>
            </li>
          </ul>
        </nav>
        <div>
          <Link href="/admin">𝜋</Link>
        </div>
      </footer>
    </>
  );
}
