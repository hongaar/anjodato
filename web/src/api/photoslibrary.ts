export async function getAllAlbums(client: typeof gapi.client) {
  return await pagesIterator(
    gapi.client.photoslibrary.albums.list,
    {
      pageSize: 50,
    },
    "albums",
  );
  //   ?.sort((a, b) => {
  //   if (a.title && b.title) {
  //     return a.title.localeCompare(b.title);
  //   } else {
  //     return 0;
  //   }
  // });
}

export async function getAllPhotos(
  client: typeof gapi.client,
  albumId: string,
) {
  return await pagesIteratorInjectRequestBody(
    gapi.client.photoslibrary.mediaItems.search,
    {},
    {
      albumId,
      pageSize: 100,
    },
    "mediaItems",
  );
}

async function pagesIterator<P, S, const K extends keyof S>(
  method: (params: P) => gapi.client.Request<S>,
  params: P,
  key: K,
  pageToken?: string,
  collection: S[K] = [] as any,
): Promise<S[K]> {
  return await method({ ...params, pageToken }).then(function (response) {
    const typedResponse = response as gapi.client.Response<{
      nextPageToken?: string;
      [key: string]: any | S;
    }>;

    // @ts-ignore
    collection = [...collection, ...(typedResponse.result[key] || [])];

    if (typedResponse.result.nextPageToken) {
      return pagesIterator(
        method,
        params,
        key,
        typedResponse.result.nextPageToken,
        collection,
      );
    } else {
      return collection;
    }
  });
}

async function pagesIteratorInjectRequestBody<P, R, S, const K extends keyof S>(
  method: (params: P, body: R) => gapi.client.Request<S>,
  params: P,
  body: R,
  key: K,
  pageToken?: string,
  collection: S[K] = [] as any,
): Promise<S[K]> {
  return await method(params, { ...body, pageToken }).then(function (response) {
    const typedResponse = response as gapi.client.Response<{
      nextPageToken?: string;
      [key: string]: any | S;
    }>;

    // @ts-ignore
    collection = [...collection, ...(typedResponse.result[key] || [])];

    if (typedResponse.result.nextPageToken) {
      return pagesIteratorInjectRequestBody(
        method,
        params,
        body,
        key,
        typedResponse.result.nextPageToken,
        collection,
      );
    } else {
      return collection;
    }
  });
}
