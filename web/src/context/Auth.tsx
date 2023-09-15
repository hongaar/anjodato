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

export const AuthContext = createContext<Context>(null as any);

export function AuthProvider({ children }: Props) {
  console.debug("Rendering AuthProvider");

  const [user, setUser] = useSessionStorage<User>("user", null);

  const firebase = useFirebase();
  const auth = useMemo(() => {
    const auth = getAuth(firebase.app);

    if (process.env.NODE_ENV === "development") {
      try {
        console.log("connect!");
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
      } catch {}
    }

    return auth;
  }, [firebase]);

  const provider = useMemo(() => {
    return new GoogleAuthProvider();
  }, []);

  async function login() {
    console.debug("Rendering context Auth");

    const result = await signInWithPopup(auth, provider);

    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential) {
      throw new Error("No credential");
    }

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
