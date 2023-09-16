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

async function pagesIterator<R, S, const K extends keyof S>(
  method: (request: R) => gapi.client.Request<S>,
  params: R,
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
    collection = [...collection, ...typedResponse.result[key]];

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
