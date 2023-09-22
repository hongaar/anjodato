import type {
  CallableFunction,
  cleanPhotos,
  downloadPhoto,
} from "@anjodato/functions";
import { CollectionReference, DocumentReference } from "firebase/firestore";

export enum Collection {
  Labels = "labels",
  Updates = "updates",
  Comments = "comments",
}

export enum Functions {
  CleanPhotos = "cleanPhotos",
  DownloadPhoto = "downloadPhoto",
}

export type FunctionTypes = {
  [Functions.CleanPhotos]: typeof cleanPhotos;
  [Functions.DownloadPhoto]: typeof downloadPhoto;
};

export type FunctionParams<Function> = Function extends CallableFunction<
  infer Params,
  unknown
>
  ? Params
  : never;

export type FunctionReturn<Function> = Function extends CallableFunction<
  unknown,
  infer Return
>
  ? Awaited<Return>
  : never;

export type Label = {
  emoji: string;
  name: string;
};

export type Update = {
  label: DocumentReference<Label> | null;
  date: {
    start: Date;
    end: Date | null;
  };
  location: {
    name: string;
    country: string;
    place_id: string;
  };
  description: {
    title: string | null;
    body: string | null;
  };
  photos: {
    album: {
      id: string;
      url: string;
      name: string;
    } | null;
    items: {
      path: string;
      url: string;
      source_id: string;
      source_url: string;
      height: number;
      width: number;
      created_on: string;
    }[];
  };
  comments: CollectionReference<Comment>;
};

export type Comment = {
  date: Date;
  name: string;
  comment: string;
};

type DocEnum = {
  [Collection.Labels]: Label;
  [Collection.Updates]: Update;
  [Collection.Comments]: Comment;
};

export type Doc<T extends Collection> = DocEnum[T];

export type DocWithId<T extends Collection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;

export type AddIdAndRef<T> = { id: string; _ref: DocumentReference<T> } & T;
