import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import type fetchType from "node-fetch";

type Params = {
  url: string;
  path: string;
};

type Return = {
  publicUrl: string;
};

const fetch = (...args: Parameters<typeof fetchType>) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

export const getPhoto = onCall<Params, Promise<Return>>(
  { region: "europe-west1", cors: "*" },
  async ({ data, auth }) => {
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
      throw new HttpsError("invalid-argument", "URL not specified.");
    }

    if (!data.path) {
      throw new HttpsError("invalid-argument", "Path not specified.");
    }

    logger.info("Got cors proxy request for url:", data.url);

    try {
      const file = admin.storage().bucket().file(data.path);

      await fetch(data.url).then((res) => {
        if (res.body === null) {
          throw new Error("Response body is empty");
        }

        logger.info("Got photo response");

        return new Promise<void>((resolve, reject) => {
          const dest = file.createWriteStream();
          res.body!.pipe(dest);
          res.body!.on("end", resolve);
          dest.on("error", reject);
        });
      });

      logger.info("Saved photo");

      return {
        publicUrl: file.publicUrl(),
      };
    } catch (error) {
      logger.error(error);
      throw new HttpsError("not-found", "Error while loading photo.");
    }
  },
);
