import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";

type CleanPhotosParams = {
  updateId: string;
};

type CleanPhotosReturn = {};

export const cleanPhotos = onCall<
  CleanPhotosParams,
  Promise<CleanPhotosReturn>
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

  if (!data.updateId) {
    throw new HttpsError("invalid-argument", "updateId not specified.");
  }

  logger.info({ message: "Got cleanPhotos request", data });

  try {
    const bucket = admin.storage().bucket();

    const [files] = await bucket.getFiles({
      prefix: `images/${data.updateId}`,
    });

    logger.info({
      message: "Deleting files",
      data: files.map((file) => file.name),
    });

    await bucket.deleteFiles({
      prefix: `images/${data.updateId}`,
    });

    return {};
  } catch (error) {
    logger.error(error);
    throw new HttpsError("internal", "Error while cleaning photos.");
  }
});
