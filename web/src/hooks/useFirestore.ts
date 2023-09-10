import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  DocumentData,
  getFirestore,
  query,
  QueryConstraint,
  QuerySnapshot,
  setDoc,
} from "firebase/firestore";
import { useCallback, useMemo } from "react";
import {
  useCollection as useBaseCollection,
  useDocumentData as useBaseDocument,
} from "react-firebase-hooks/firestore";
import { AddId, Collection, Doc } from "../api";
import { useFirebase } from "./useFirebase";

export function useFirestore() {
  const firebase = useFirebase();
  const firestore = useMemo(() => {
    const db = getFirestore(firebase.app);

    if (process.env.NODE_ENV === "development") {
      try {
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
      } catch {}
    }

    return db;
  }, [firebase]);

  return firestore;
}

export function useCollectionRef(collectionId: Collection) {
  const firestore = useFirestore();

  return useMemo(
    () => collection(firestore, collectionId),
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

export function useCollection<T extends Collection>(collectionId: T) {
  const collectionRef = useCollectionRef(collectionId);
  const [snapshot, loading, error] = useBaseCollection<Doc<T>>(
    collectionRef as any,
  );

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return [];
  }

  return getCollectionData(snapshot);
}

export function useQuery<T extends Collection>(
  collectionId: T,
  ...queryConstraints: QueryConstraint[]
) {
  const collectionRef = useCollectionRef(collectionId);
  const [snapshot, loading, error] = useBaseCollection<Doc<T>>(
    query(collectionRef as any, ...queryConstraints),
  );

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return [];
  }

  return getCollectionData(snapshot);
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

  return data;
}

export function useDocWriter<T extends Collection>(collectionId: T) {
  const collectionRef = useCollectionRef(collectionId);

  return useCallback(
    async function (docId: string, data: Partial<Doc<T>>) {
      await setDoc(doc(collectionRef, docId), data, { merge: true });
    },
    [collectionRef],
  );
}

export function useDocDeleter(collectionId: Collection) {
  const collectionRef = useCollectionRef(collectionId);

  return useCallback(
    async function (docId: string) {
      await deleteDoc(doc(collectionRef, docId));
    },
    [collectionRef],
  );
}

function getCollectionData<T extends DocumentData>(snapshot: QuerySnapshot<T>) {
  const data: AddId<T>[] = [];
  snapshot.forEach(function (doc) {
    data.push({ id: doc.id, ...doc.data() } as any);
  });

  return data;
}
