export enum Collection {
  Updates = "updates",
}

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
      body: string;
    };
    photos: {
      album: {
        id: string;
        url: string;
        name: string;
        image_url: string;
      } | null;
    };
  };
};

export type Doc<T extends Collection> = DocEnum[T];

export type DocWithId<T extends Collection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;
