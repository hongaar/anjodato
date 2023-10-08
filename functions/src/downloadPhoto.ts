import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import type fetchType from "node-fetch";

type DownloadPhotoParams = {
  url: string;
  path: string;
};

type DownloadPhotoReturn = {
  publicUrl: string;
};

const MAX_AGE = 15552000;

const fetch = (...args: Parameters<typeof fetchType>) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

export const downloadPhoto = onCall<
  DownloadPhotoParams,
  Promise<DownloadPhotoReturn>
>({ region: "europe-west1", cors: "*" }, async ({ data, auth }) => {
  if (auth === undefined) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  if (auth.token.email !== "hongaar@gmail.com") {
    throw new HttpsError("permission-denied", "Logged in, but not allowed.");
  }

  if (!data.url) {
    throw new HttpsError("invalid-argument", "url not specified.");
  }

  if (!data.path) {
    throw new HttpsError("invalid-argument", "path not specified.");
  }

  logger.info({ message: "Got downloadPhoto request", data });

  try {
    const file = admin.storage().bucket().file(data.path);

    await file.create();

    await file.setMetadata({
      "Cache-Control": `public, max-age=${MAX_AGE}`,
    });

    await fetch(data.url).then((res) => {
      if (res.body === null) {
        throw new Error("Response body is empty");
      }

      return new Promise<void>((resolve, reject) => {
        const dest = file.createWriteStream();
        res.body!.pipe(dest);
        res.body!.on("end", resolve);
        dest.on("error", reject);
      });
    });

    logger.info(`Saved photo to ${data.path}`);

    return {
      publicUrl: file.publicUrl(),
    };
  } catch (error) {
    logger.error(error);
    throw new HttpsError("internal", "Error while loading photo.");
  }
});
