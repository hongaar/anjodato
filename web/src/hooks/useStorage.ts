import {
  UploadMetadata,
  connectStorageEmulator,
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import { useMemo } from "react";
import { useUploadFile as useBaseUploadFile } from "react-firebase-hooks/storage";
import { useFirebase } from "./useFirebase";

const USE_EMULATOR = false;

function useStorage() {
  const firebase = useFirebase();
  const storage = useMemo(() => {
    const storage = getStorage(firebase.app);

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectStorageEmulator(storage, "localhost", 9199);
      } catch {}
    }

    return storage;
  }, [firebase]);

  return storage;
}

export function useStorageRef(file: string) {
  const storage = useStorage();

  return useMemo(() => ref(storage, file), [storage, file]);
}

export function useGetDownloadUrl() {
  const storage = useStorage();

  const getUrl = async (file: string) => {
    const fileRef = ref(storage, file);
    const result = await getDownloadURL(fileRef);

    return result;
  };

  return { getUrl };
}

export function useUploadFile() {
  const [uploadFile, uploading, snapshot, error] = useBaseUploadFile();
  const storage = useStorage();

  const upload = async (
    file: string,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata,
  ) => {
    const fileRef = ref(storage, file);
    const result = await uploadFile(fileRef, data, metadata);

    return result;
  };

  return { upload, uploading, snapshot, error };
}

export function useRemoveFile() {
  const storage = useStorage();

  const remove = async (file: string) => {
    const fileRef = ref(storage, file);

    await deleteObject(fileRef);
  };

  return remove;
}

export function useListFiles() {
  const storage = useStorage();

  const list = async (path: string) => {
    const pathRef = ref(storage, path);
    const result = await listAll(pathRef);

    return result.items;
  };

  return list;
}
