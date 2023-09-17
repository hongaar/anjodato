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
      body: string | null;
    };
    photos: {
      album: {
        id: string;
        url: string;
        name: string;
      } | null;
      items: {
        id: string;
        url: string;
        thumb_url: string;
        image_url: string;
        height: string;
        width: string;
        created_on: string;
      }[];
    };
  };
};

export type Doc<T extends Collection> = DocEnum[T];

export type DocWithId<T extends Collection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;
