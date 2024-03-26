import { limit, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import nl2br from "react-nl2br";
import { Link } from "wouter";
import { Collection, dateFormat, updateTitle } from "../api";
import { Nav } from "../components";
import { Photos } from "../components/Blog";
import {
  useCollectionGroupRef,
  useCollectionOnce,
  useQueryOnce,
  useQueryOnceFromRef,
} from "../hooks";

const COMMENTS_LIMIT = 10;
const PHOTO_LIMIT = 20;

export function Activity() {
  console.debug("Rendering page Activity");

  const commentsRef = useCollectionGroupRef(Collection.Comments);
  const [comments] = useQueryOnceFromRef(
    commentsRef,
    orderBy("date", "desc"),
    limit(COMMENTS_LIMIT),
  );
  const [likes] = useQueryOnce(
    [Collection.Likes],
    orderBy("counter", "desc"),
    limit(PHOTO_LIMIT),
  );
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

    const sortedLikes = likes.map((like) => {
      return {
        url: like.url,
        width: photoDimensionsMap.get(like.url)?.width || 200,
        height: photoDimensionsMap.get(like.url)?.height || 200,
      };
    });

    return sortedLikes;
  }, [likes, updates]);

  console.log({ comments });

  return (
    <>
      <Helmet>
        <title>Populair</title>
      </Helmet>
      {/* <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Reacties</p>
        </hgroup>
      </header> */}
      <main className="container-fluid">
        <article>
          <div className="grid">
            <div>
              <h3>Recente reacties</h3>
              {comments === null || updates === null ? (
                <span aria-busy="true">Reacties laden...</span>
              ) : comments.length > 0 ? (
                <ol className="comments">
                  {comments.map((comment) => {
                    const update = updates.find(
                      (update) => update.id === comment._ref.parent!.parent!.id,
                    )!;
                    return (
                      <li key={comment.id}>
                        <small>
                          Door <strong>{comment.name}</strong> op{" "}
                          <strong>{dateFormat(comment.date)}</strong>
                        </small>
                        <br />
                        {nl2br(comment.comment)}
                        <br />
                        <small>
                          Geschreven bij{" "}
                          <Link href={`/bericht/${update.id}`}>
                            {updateTitle(update)}
                          </Link>
                        </small>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p>Geen reacties</p>
              )}
            </div>
            <div>
              <h3>Mooiste foto's</h3>
              {popularPhotoItems === null ? (
                <span aria-busy="true">Foto's laden...</span>
              ) : popularPhotoItems.length > 0 ? (
                <Photos items={popularPhotoItems} likes={likes} />
              ) : (
                <p>Geen foto's</p>
              )}
            </div>
          </div>
        </article>
      </main>
      <footer className="container-fluid">
        <Nav />
      </footer>
    </>
  );
}
