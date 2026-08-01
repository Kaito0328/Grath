"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { ensureClientSdkReady } from "../shared/wasm/ensureClientSdkReady";

export function Providers({ children }: { children: React.ReactNode }) {
  // Start initialization once for the whole application. Generated Type API
  // classes are synchronous after this point, so feature components do not
  // need to import or bind wasm modules themselves.
  useEffect(() => {
    void ensureClientSdkReady();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark"]}
    >
      {children}
    </ThemeProvider>
  );
}
