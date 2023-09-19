import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import type fetchType from "node-fetch";
// @ts-ignore
import type { Response } from "node-fetch";

type Params = {
  url: string;
};

type Return = {
  body: string;
};

const responseToDataUrl = async (response: Response) => {
  const contentType = response.headers.get("Content-Type");
  const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
  return "data:" + contentType + ";base64," + base64;
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

    logger.info("Got cors proxy request for url:", data.url);

    try {
      const response = await fetch(decodeURI(String(data.url)));
      const body = await responseToDataUrl(response);

      return {
        body,
      };
    } catch (error) {
      logger.error(error);
      throw new HttpsError("not-found", "Error while loading photo.");
    }
  },
);
