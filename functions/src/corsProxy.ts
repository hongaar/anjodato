/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError, onCall } from "firebase-functions/v2/https";

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const corsProxy = onCall(
  { region: "europe-west1", cors: true },
  ({ data, auth }) => {
    if (auth === undefined) {
      throw new HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      );
    }

    if (auth.token.email !== "hongaar@gmail.com") {
      throw new HttpsError(
        "failed-precondition",
        "Logged in, but not allowed.",
      );
    }

    return data;
  },
);

/*

export const corsProxy = onRequest((req, res) => {
  // Reject requests that don't have a URL.
  if (!req.query.url) {
    res.json({ error: "No URL provided!" });
    return;
  }

  // Extract necessary information from the request.
  const { body, headers, method } = req;

  // deleting these headers prevents the following error:
  // "Hostname/IP does not match certificate's altnames"
  //
  // See this GitHub issue answer for more
  // https://github.com/node-fetch/node-fetch/discussions/1678#discussioncomment-4191424
  delete headers.host;
  delete headers.referer;

  // Create the "options" object for the fetch request.
  const options: any = { headers, method };

  // Add the body to "options", if it exists and if this is not a GET request.
  if (body && method !== "GET") options.body = body;

  // Send the request to the URL provided and return the response.
  // Wrapping fetch in cors() sets the necessary CORS headers.
  cors({ origin: true })(req, res, () =>
    // decoding the URI is important if in case queries were pre-encoded.
    fetch(decodeURI(String(req.query.url)), options)
      .then((r) =>
        r.headers.get("content-type") === "application/json"
          ? r.json()
          : r.text(),
      )
      .then((r) => res.send(r))
      .catch((e) => res.json({ error: e.message })),
  );
});

*/

/**

  cors(req, res, () => {
    console.log('Query:', req.query);
    console.log('Body:', req.body);

    let url = req.query.url;

    if (!url) {
      url = req.body.url;
    }

    if (!url) {
      res.status(403).send('URL is empty.');
    }

    console.log('Request:', url);

    // disallow blocked phrases
    if (url.match(blockedPhrases)) {
      res.status(403).send('Phrase in URL is disallowed.');
    }

    fetch(url, {
      method: req.method,
      body: req.get('content-type') === 'application/json' ? JSON.stringify(req.body) : req.body,
      headers: {
        'Content-Type': req.get('Content-Type'),
      },
    })
    .then(r => r.headers.get('content-type') === 'application/json' ? r.json() : r.text())
    .then(body => res.status(200).send(body));
  });

*/
