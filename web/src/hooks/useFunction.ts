import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { useMemo } from "react";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import {
  FunctionParams,
  FunctionReturn,
  FunctionTypes,
  Functions,
} from "../api";
import { useFirebase } from "./useFirebase";

const USE_EMULATOR = true;

function useFunctions() {
  const firebase = useFirebase();
  const functions = useMemo(() => {
    const functions = getFunctions(firebase.app, "europe-west1");

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectFunctionsEmulator(functions, "localhost", 5001);
      } catch {}
    }

    return functions;
  }, [firebase]);

  return functions;
}

export function useFunction(fn: Functions) {
  const functions = useFunctions();

  const [executeCallable, , error] = useHttpsCallable<
    FunctionParams<FunctionTypes[typeof fn]>,
    FunctionReturn<FunctionTypes[typeof fn]>
  >(functions, fn);

  async function run(data?: FunctionParams<FunctionTypes[typeof fn]>) {
    const result = await executeCallable(data);

    if (error) {
      throw error;
    }

    return result;
  }

  return run;
}
