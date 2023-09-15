import { useContext } from "react";
import { FirebaseContext } from "../context";

export function useFirebase() {
  console.debug("Called useFirebase");

  return useContext(FirebaseContext);
}
