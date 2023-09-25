import {
  DocumentData,
  DocumentReference,
  Firestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
  collection,
  doc,
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
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import { Link } from "wouter";
import {
  AddId,
  AddIdAndRef,
  Collection,
  Doc,
  Label,
  Update as UpdateType,
} from "../api";
import { Labels, Update } from "../components/Blog";
import {
  getCollectionData,
  useCollection,
  useCollectionOnce,
  useFirestore,
} from "../hooks";

const PAGE_SIZE = 10;

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
  console.log("Fetching updates", {
    sort,
    labelRef,
  });

  const updatesRef = collection(firestore, Collection.Updates);
  const q = query(
    updatesRef,
    orderBy("date.start", sort),
    limit(PAGE_SIZE),
    ...(labelRef ? [where("label", "==", labelRef)] : []),
    ...(cursor ? [startAfter(cursor)] : []),
  );
  const querySnapshot = (await getDocs(q)) as QuerySnapshot<
    Doc<Collection.Updates>
  >;

  if (querySnapshot.docs.length > 0) {
    setCursor(querySnapshot.docs[querySnapshot.docs.length - 1]);
  }

  return getCollectionData(querySnapshot);
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
  const [localLabels, setLocalLabels] = useSessionStorage<
    AddId<Label>[] | null
  >("labels", null);
  const [freshLabels] = useCollectionOnce(Collection.Labels);
  const [labels, setLabels] = useState(localLabels);
  const likes = useCollection(Collection.Likes);
  const [updates, setUpdates] = useState<AddIdAndRef<UpdateType>[] | null>(
    null,
  );

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
    ).then((updates) => {
      setUpdates(updates);
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
    const newUpdates = await fetchUpdates(
      firestore,
      sortDesc ? "desc" : "asc",
      cursor,
      setCursor,
      labelRef,
    );

    setUpdates([...updates, ...newUpdates]);

    target.setAttribute("aria-busy", "false");
  }

  return (
    <>
      <Helmet>
        <title>{label ? `${label} / ` : ""} Blog</title>
      </Helmet>
      <header className="container-fluid">
        <hgroup>
          <Link href="/">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <h1>AnJoDaTo</h1>
            </a>
          </Link>
          <p>Blog{label ? ` / ${label}` : null}</p>
        </hgroup>
      </header>
      <Labels labels={localLabels} activeName={label} />
      <main className="container-fluid">
        {localLabels === null ? null : updates === null ? (
          <article>
            <p aria-busy="true">Berichten laden...</p>
          </article>
        ) : updates.length > 0 ? (
          <>
            {updates.map((update) => (
              <Update update={update} likes={likes} key={update.id} />
            ))}
            <p className="text-center">
              <button className="inline-button" onClick={loadMore}>
                Meer berichten laden
              </button>
            </p>
          </>
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
          🗺️ <Link href="/kaart">Naar de kaart</Link>
        </div>
        <div className="text-right">
          <Link href="/admin">𝜋</Link>
        </div>
      </footer>
    </>
  );
}
