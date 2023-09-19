import type { CallableFunction, getPhoto } from "@anjodato/functions";

export enum Collection {
  Updates = "updates",
}

export enum Functions {
  GetPhoto = "getPhoto",
}

export type FunctionTypes = {
  [Functions.GetPhoto]: typeof getPhoto;
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

type DocEnum = {
  [Collection.Updates]: {
    date: {
      start: string;
      end: string | null;
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
  };
};

export type Doc<T extends Collection> = DocEnum[T];

export type DocWithId<T extends Collection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;
