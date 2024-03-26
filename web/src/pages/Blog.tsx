import {
  DocumentData,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import isEqual from "lodash.isequal";
import { MouseEvent, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useInView } from "react-intersection-observer";
import { useLocalStorage } from "usehooks-ts";
import { Link } from "wouter";
import {
  AddId,
  AddIdAndRef,
  Collection,
  Doc,
  Label,
  Update as UpdateType,
} from "../api";
import { Nav } from "../components";
import { Labels, Update } from "../components/Blog";
import {
  getCollectionData,
  useCollection,
  useCollectionOnce,
  useFirestore,
} from "../hooks";

const PAGE_SIZE = 5;

function getLabelRef(
  firestore: Firestore,
  labels: AddId<Label>[],
  label?: string,
) {
  const labelId = label ? labels.find((item) => item.name === label)?.id : null;
  const ref = labelId
    ? (doc(
        collection(firestore, Collection.Labels),
        labelId,
      ) as DocumentReference<Label>)
    : null;

  return ref;
}

async function fetchUpdates(
  firestore: Firestore,
  sort: "asc" | "desc",
  cursor: QueryDocumentSnapshot<UpdateType, DocumentData> | null,
  setCursor: React.Dispatch<
    React.SetStateAction<QueryDocumentSnapshot<UpdateType, DocumentData> | null>
  >,
  labelRef: DocumentReference<Label> | null,
) {
  console.log("Querying updates", {
    sort,
    labelRef,
    cursor: cursor ? cursor.ref.path : null,
  });

  const updatesRef = collection(firestore, Collection.Updates);

  const countQuery = query(
    updatesRef,
    ...(labelRef ? [where("label", "==", labelRef)] : []),
  );

  const updatesQuery = query(
    updatesRef,
    orderBy("date.start", sort),
    limit(PAGE_SIZE),
    ...(labelRef ? [where("label", "==", labelRef)] : []),
    ...(cursor ? [startAfter(cursor)] : []),
  );

  const querySnapshot = (await getDocs(updatesQuery)) as QuerySnapshot<
    Doc<Collection.Updates>
  >;

  async function getCount() {
    return (await getCountFromServer(countQuery)).data().count;
  }

  if (querySnapshot.docs.length > 0) {
    setCursor(querySnapshot.docs[querySnapshot.docs.length - 1]);
  }

  return { data: getCollectionData(querySnapshot), getCount };
}

export function Blog({ params }: { params: { label: string } }) {
  console.debug("Rendering page Blog");

  const label = params.label ? decodeURIComponent(params.label) : undefined;
  const firestore = useFirestore();
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<
    UpdateType,
    DocumentData
  > | null>(null);
  const [sortDesc, setSortDesc] = useLocalStorage("sortDesc", true);
  const [autoLoadMore, setAutoLoadMore] = useLocalStorage(
    "autoLoadMore",
    false,
  );
  const [showWhatsAppBanner, setShowWhatsAppBanner] = useLocalStorage(
    "showWhatsAppBanner",
    true,
  );
  const [localLabels, setLocalLabels] = useLocalStorage<AddId<Label>[] | null>(
    "labels",
    null,
  );
  const [freshLabels] = useCollectionOnce(Collection.Labels);
  const [labels, setLabels] = useState(localLabels);
  const likes = useCollection(Collection.Likes);
  const [updates, setUpdates] = useState<AddIdAndRef<UpdateType>[] | null>(
    null,
  );
  const [updatesCount, setUpdatesCount] = useState<number | null>(null);
  const { ref: inViewRef, inView, entry } = useInView();

  useEffect(() => {
    if (autoLoadMore && inView && entry?.target) {
      (entry.target as any).click();
    }
  }, [entry, inView, autoLoadMore]);

  useEffect(() => {
    if (!isEqual(labels, localLabels)) {
      setLabels(localLabels);
    }
  }, [labels, localLabels]);

  useEffect(() => {
    if (freshLabels !== null) {
      const candidate = freshLabels.map((label) => ({
        ...label,
        _ref: null,
      }));
      if (!isEqual(candidate, localLabels)) {
        setLocalLabels(candidate);
      }
    }
  }, [freshLabels, localLabels, setLocalLabels]);

  useEffect(() => {
    if (labels === null) {
      return;
    }

    setUpdates(null);
    const labelRef = getLabelRef(firestore, labels, label);
    fetchUpdates(
      firestore,
      sortDesc ? "desc" : "asc",
      null,
      setCursor,
      labelRef,
    )
      .then(({ data, getCount }) => {
        setUpdates(data);
        return getCount();
      })
      .then((count) => {
        setUpdatesCount(count);
      });
  }, [firestore, label, labels, sortDesc]);

  async function loadMore(e: MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;

    if (labels === null) {
      return;
    }

    if (updates === null) {
      return;
    }

    target.setAttribute("aria-busy", "true");

    const labelRef = getLabelRef(firestore, labels, label);
    const { data } = await fetchUpdates(
      firestore,
      sortDesc ? "desc" : "asc",
      cursor,
      setCursor,
      labelRef,
    );

    setUpdates([...updates, ...data]);

    target.setAttribute("aria-busy", "false");
  }

  return (
    <>
      <Helmet>
        <title>{label ? `${label} / ` : ""} Blog</title>
      </Helmet>
      {/* <header className="container-fluid">
        <hgroup>
          <h1>AnJoDaTo</h1>
          <p>Blog{label ? ` / ${label}` : null}</p>
        </hgroup>
      </header> */}
      <nav className="sticky">
        <Link role="button" href="/kaart">
          🗺️ Kaart
        </Link>
      </nav>
      <Labels labels={localLabels} activeName={label} />
      <main className="container-fluid">
        {showWhatsAppBanner ? (
          <p className="text-center">
            🔔{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://chat.whatsapp.com/Iz6lHapa9Jl8WdWj7FGUDN"
            >
              Blijf op de hoogte van nieuwe berichten
            </a>{" "}
            via WhatsApp.{" "}
            <button
              className="inline outline secondary"
              onClick={() => setShowWhatsAppBanner(false)}
            >
              ❌ Verberg dit bericht
            </button>
          </p>
        ) : null}
        {localLabels === null ? null : updates === null ? (
          <article>
            <p aria-busy="true">Berichten laden...</p>
          </article>
        ) : updates.length > 0 ? (
          <>
            {updates.map((update) => (
              <Update update={update} likes={likes} key={update.id} />
            ))}
            {updatesCount !== null && updatesCount > updates.length ? (
              <>
                {autoLoadMore ? null : (
                  <p className="text-center">
                    {updatesCount - updates.length === 1
                      ? `Er is nog 1 ${sortDesc ? "ouder" : "nieuwer"} bericht.`
                      : `Er zijn nog ${updatesCount - updates.length} ${
                          sortDesc ? "oudere" : "nieuwere"
                        } berichten.`}
                  </p>
                )}
                <p className="text-center">
                  <button
                    ref={inViewRef}
                    className={`inline-button ${autoLoadMore ? "link" : ""}`}
                    onClick={loadMore}
                  >
                    Meer berichten laden
                  </button>
                </p>
              </>
            ) : null}
          </>
        ) : (
          <article>
            <p>Geen berichten</p>
          </article>
        )}
        <p className="text-center">
          🔔{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://chat.whatsapp.com/Iz6lHapa9Jl8WdWj7FGUDN"
          >
            Blijf op de hoogte van nieuwe berichten
          </a>{" "}
          via WhatsApp.
        </p>
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
          <label>
            <input
              type="checkbox"
              name="sortDesc"
              checked={autoLoadMore}
              onChange={(e) => setAutoLoadMore(!autoLoadMore)}
            />
            Automatisch meer berichten laden
          </label>
        </div>
        <Nav />
      </footer>
    </>
  );
}
