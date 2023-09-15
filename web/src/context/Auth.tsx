import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import { createContext, useMemo } from "react";
import { useFirebase } from "../hooks";

import { useSessionStorage } from "usehooks-ts";

type Props = {
  children: React.ReactNode;
};

type User = {
  token: string;
  email: string | null;
  name: string | null;
  picture: string | null;
} | null;

type Context = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
};

const USE_EMULATOR = false;

export const AuthContext = createContext<Context>(null as any);

export function AuthProvider({ children }: Props) {
  console.debug("Rendering AuthProvider");

  const [user, setUser] = useSessionStorage<User>("user", null);

  const firebase = useFirebase();
  const auth = useMemo(() => {
    const auth = getAuth(firebase.app);

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectAuthEmulator(auth, "http://localhost:9099");
      } catch {}
    }

    return auth;
  }, [firebase]);

  const provider = useMemo(() => {
    const provider = new GoogleAuthProvider();

    // See https://developers.google.com/identity/protocols/oauth2/scopes#photoslibrary
    provider.addScope("https://www.googleapis.com/auth/photoslibrary.readonly");

    return provider;
  }, []);

  async function login() {
    console.debug("Rendering context Auth");

    const result = await signInWithPopup(auth, provider);

    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential) {
      throw new Error("No credential");
    }

    console.log({ result, credential });

    const token = credential.accessToken;

    if (!token) {
      throw new Error("No token");
    }

    // The signed-in user info.
    const user = result.user;

    setUser({
      token,
      email: user.email,
      name: user.displayName,
      picture: user.photoURL,
    });
  }

  async function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
