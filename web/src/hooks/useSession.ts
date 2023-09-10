import { useContext } from "react";
import { SessionContext } from "../context";

export function useSession() {
  return useContext(SessionContext);
}
