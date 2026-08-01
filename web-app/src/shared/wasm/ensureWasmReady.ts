let initPromise: Promise<unknown> | null = null;

type WasmModuleWithOptionalInit = Omit<typeof import("wasm-lib"), "default"> & {
  default?: () => Promise<unknown>;
  initSync?: unknown;
};

const hasStringHref = (value: unknown): value is { href: string } =>
  typeof value === "object" && value !== null && "href" in value && typeof value.href === "string";

export async function ensureWasmReady() {
  if (!initPromise) {
    initPromise = (async () => {
      // wasm-pack may export either an initializer function or a module as
      // `default`, depending on its bundling target. The runtime guard below
      // handles both forms.
      const wasm = (await import("wasm-lib")) as unknown as WasmModuleWithOptionalInit;

      // If wasm-pack was built with a target that requires explicit init,
      // `wasm-lib` will export `default` (async init) / `initSync`.
      // For bundler-style builds, simply importing the module is enough.
      const maybeInitSync = wasm.initSync;
      const maybeInit = wasm.default;

      if (typeof maybeInitSync === "function" && typeof maybeInit === "function") {
        // Some fetch polyfills choke on URL-like objects; normalize URL -> string.
        const originalFetch = globalThis.fetch;
        if (typeof originalFetch === "function") {
          const normalizedFetch: typeof globalThis.fetch = (input, init) => {
            if (typeof Request === "function" && input instanceof Request) {
              return originalFetch(input, init);
            }
            if (typeof URL === "function" && input instanceof URL) {
              return originalFetch(input.toString(), init);
            }
            // Avoid passing non-standard URL objects into some fetch implementations.
            if (hasStringHref(input)) {
              return originalFetch(input.href, init);
            }
            return originalFetch(input, init);
          };
          globalThis.fetch = normalizedFetch;
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
