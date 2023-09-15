export enum Collection {
  Updates = "updates",
}

type DocEnum = {
  [Collection.Updates]: {
    location: {
      name: string;
      country: string;
      place_id: string;
    };
    description: {
      title: string;
      body: string;
    };
    photos: {
      album: string;
    };
  };
};

export type Doc<T extends Collection> = DocEnum[T];

export type DocWithId<T extends Collection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;
