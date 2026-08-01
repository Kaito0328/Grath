let initPromise: Promise<unknown> | null = null;

export async function ensureWasmReady() {
  if (!initPromise) {
    initPromise = (async () => {
      const wasm = await import("wasm-lib");

      // If wasm-pack was built with a target that requires explicit init,
      // `wasm-lib` will export `default` (async init) / `initSync`.
      // For bundler-style builds, simply importing the module is enough.
      const maybeInitSync = (wasm as any).initSync;
      const maybeInit = (wasm as any).default;

      if (typeof maybeInitSync === "function" && typeof maybeInit === "function") {
        // Some fetch polyfills choke on URL-like objects; normalize URL -> string.
        const originalFetch = globalThis.fetch;
        if (typeof originalFetch === "function") {
          globalThis.fetch = ((input: any, init?: any) => {
            if (typeof Request === "function" && input instanceof Request) {
              return (originalFetch as any)(input, init);
            }
            if (typeof URL === "function" && input instanceof URL) {
              return (originalFetch as any)(input.toString(), init);
            }
            // Avoid passing non-standard URL objects into some fetch implementations.
            if (input && typeof input === "object" && typeof (input as any).href === "string") {
              return (originalFetch as any)(String((input as any).href), init);
            }
            return (originalFetch as any)(input, init);
          }) as any;
        }

        try {
          await maybeInit();
        } finally {
          if (typeof originalFetch === "function") globalThis.fetch = originalFetch;
        }
      }

      return wasm;
    })();
  }
  return (await initPromise) as typeof import("wasm-lib");
}
