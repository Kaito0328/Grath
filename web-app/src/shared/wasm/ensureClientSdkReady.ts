import { ensureWasmReady } from "./ensureWasmReady";

import { bindWasmFromWasmLib } from "@my-project/client-sdk";

import { setEnsureReady } from "@my-project/client-sdk/api/runtime";

let clientSdkReady: Promise<void> | null = null;

export async function ensureClientSdkReady() {
  if (!clientSdkReady) {
    clientSdkReady = (async () => {
      const wasm = await ensureWasmReady();
	  bindWasmFromWasmLib(wasm);
    })();
  }
  return clientSdkReady;
}

// Register the app-specific wasm initialization hook for client-sdk generated APIs.
setEnsureReady(() => ensureClientSdkReady());
