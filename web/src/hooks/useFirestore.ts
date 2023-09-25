import {
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  DocumentData,
  getFirestore,
  query,
  QueryConstraint,
  QuerySnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { useCallback, useMemo } from "react";
import {
  useCollection as useBaseCollection,
  useCollectionOnce as useBaseCollectionOnce,
  useDocumentData as useBaseDocument,
  useDocumentDataOnce as useBaseDocumentOnce,
} from "react-firebase-hooks/firestore";
import { AddIdAndRef, Collection, Doc } from "../api";
import { useFirebase } from "./useFirebase";

type LastElementOf<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer Last,
]
  ? Last
  : never;

type CollectionPath =
  | [Collection]
  | [Collection, string, Collection]
  | [Collection, string, Collection, string, Collection];

const USE_EMULATOR = false;

export function useFirestore() {
  const firebase = useFirebase();
  const firestore = useMemo(() => {
    const db = getFirestore(firebase.app);

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectFirestoreEmulator(db, "localhost", 8080);
      } catch {}
    }

    return db;
  }, [firebase]);

  return firestore;
}

export function useCollectionRef(...path: CollectionPath) {
  const firestore = useFirestore();

  return useMemo(
    () => collection(firestore, path[0], ...path.slice(1)),
    [path, firestore],
  );
}

export function useCollectionGroupRef(collectionId: Collection) {
  const firestore = useFirestore();

  return useMemo(
    () => collectionGroup(firestore, collectionId),
    [collectionId, firestore],
  );
}

export function useDocRef(collectionId: Collection, docId: string) {
  const firestore = useFirestore();

  return useMemo(
    () => doc(collection(firestore, collectionId), docId),
    [collectionId, docId, firestore],
  );
}

export function useCollection<R extends CollectionPath>(...path: R) {
  const collectionRef = useCollectionRef(...path);
  const [snapshot, loading, error] = useBaseCollection<Doc<LastElementOf<R>>>(
    collectionRef as any,
  );

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return null;
  }

  return getCollectionData(snapshot);
}

export function useCollectionGroup<T extends Collection>(collectionId: T) {
  const collectionRef = useCollectionGroupRef(collectionId);
  const [snapshot, loading, error] = useBaseCollection<Doc<T>>(
    collectionRef as any,
  );

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return null;
  }

  return getCollectionData(snapshot);
}

export function useCollectionOnce<R extends CollectionPath>(
  ...collectionRef: R
) {
  const ref = useCollectionRef(...collectionRef);
  const [snapshot, loading, error, reload] = useBaseCollectionOnce<
    Doc<LastElementOf<R>>
  >(ref as any);

  return useMemo(() => {
    if (error) {
      console.error(error);
    }

    if (loading || !snapshot) {
      return [null] as const;
    }

    return [getCollectionData(snapshot), reload] as const;
  }, [error, loading, reload, snapshot]);
}

export function useQuery<R extends CollectionPath>(
  collectionRef: R,
  ...queryConstraints: QueryConstraint[]
) {
  const ref = useCollectionRef(...collectionRef);
  const [snapshot, loading, error] = useBaseCollection<Doc<LastElementOf<R>>>(
    query(ref as any, ...queryConstraints),
  );

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return [];
  }

  return getCollectionData(snapshot);
}

export function useQueryOnce<R extends CollectionPath>(
  collectionRef: R,
  ...queryConstraints: QueryConstraint[]
) {
  const ref = useCollectionRef(...collectionRef);
  const [snapshot, loading, error, reload] = useBaseCollectionOnce<
    Doc<LastElementOf<R>>
  >(query(ref as any, ...queryConstraints));

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return [null] as const;
  }

  return [getCollectionData(snapshot), reload] as const;
}

export function useDocument<T extends Collection>(
  collectionId: T,
  docId: string,
) {
  const docRef = useDocRef(collectionId, docId);
  const [data, loading, error] = useBaseDocument<Doc<T>>(docRef as any);

  if (error) {
    console.error(error);
  }

  if (loading || !data) {
    return null;
  }

  return parseDocData(data);
}

export function useDocumentOnce<T extends Collection>(
  collectionId: T,
  docId: string,
) {
  const docRef = useDocRef(collectionId, docId);
  const [data, loading, error] = useBaseDocumentOnce<Doc<T>>(docRef as any);

  if (error) {
    console.error(error);
  }

  if (loading || !data) {
    return null;
  }

  return parseDocData(data);
}

export function useDocWriter<R extends CollectionPath>(...collectionRef: R) {
  const ref = useCollectionRef(...collectionRef);

  return useCallback(
    async function (docId: string, data: Partial<Doc<LastElementOf<R>>>) {
      await setDoc(doc(ref, docId), data, { merge: true });
    },
    [ref],
  );
}

export function useDocDeleter<R extends CollectionPath>(...collectionRef: R) {
  const ref = useCollectionRef(...collectionRef);

  return useCallback(
    async function (docId: string) {
      await deleteDoc(doc(ref, docId));
    },
    [ref],
  );
}

export function getCollectionData<T extends DocumentData>(
  snapshot: QuerySnapshot<T>,
) {
  const data: AddIdAndRef<T>[] = [];
  snapshot.forEach(function (doc) {
    data.push({ id: doc.id, _ref: doc.ref, ...parseDocData(doc.data()) });
  });

  return data;
}

function parseDocData<T extends DocumentData>(data: T) {
  Object.entries(data).forEach(([key, value]) => {
    if (
      typeof value === "object" &&
      value !== null &&
      value.constructor === Object
    ) {
      // console.log({ value });
      data[key as keyof T] = parseDocData(value);
    }
    if (value instanceof Timestamp) {
      data[key as keyof T] = value.toDate() as any;
    }
  });

  return data;
}
