import { useEffect, useState } from "react";
import { useScript, useSessionStorage } from "usehooks-ts";
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from "../api";
import { useAuth } from "./useAuth";

export function useGapi() {
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useSessionStorage<string | null>(
    "access_token",
    null,
  );
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { user } = useAuth();

  const apiStatus = useScript("https://apis.google.com/js/api.js");
  const gsiStatus = useScript("https://accounts.google.com/gsi/client");

  useEffect(() => {
    if (
      apiStatus === "ready" &&
      gsiStatus === "ready" &&
      typeof gapi !== "undefined" &&
      typeof google !== "undefined"
    ) {
      setReady(true);
    }
  }, [apiStatus, gsiStatus]);

  useEffect(() => {
    if (ready) {
      gapi.load("client", () => {
        gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: [
            "https://photoslibrary.googleapis.com/$discovery/rest?version=v1",
          ],
        });

        if (accessToken) {
          gapi.client.setToken({ access_token: accessToken });
          setIsAuthorized(true);
        }
      });
    }
  }, [ready, accessToken]);

  async function authorize() {
    if (!ready) {
      throw new Error("Not ready to authorize");
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID as string,
      scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
      login_hint: user?.email || undefined,
      // prompt: "none",
      callback: (response) => {
        if (response && response.access_token) {
          setAccessToken(response.access_token);
        } else {
          throw new Error("Reponse code is empty");
        }
      },
    });

    client.requestAccessToken();
  }

  if (!ready) {
    return { isAuthorized, authorize: null, client: null };
  }

  return { isAuthorized, authorize, client: gapi.client };
}
