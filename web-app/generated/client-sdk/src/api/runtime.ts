/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk safe API runtime helpers ---

export type AppErrorPayload = {
  code: string;
  message: string;
  details?: string;
};

export const AppErrorCodes = {
  LinalgExactSizeLimit: "LINALG_EXACT_SIZE_LIMIT",
} as const;

/**
 * wasm-bindgen errors often end up as `Error: {"code":...,"message":...}`.
 * This helper extracts the JSON payload when present.
 */
export function tryParseAppErrorMessage(text: string): AppErrorPayload | null {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  const jsonText = raw.startsWith("Error: ") ? raw.slice("Error: ".length).trim() : raw;
  if (!jsonText.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== "object") return null;
    const code = (parsed as any).code;
    const message = (parsed as any).message;
    const details = (parsed as any).details;
    if (typeof code !== "string" || typeof message !== "string") return null;

    const out: AppErrorPayload = { code, message };
    if (typeof details === "string") out.details = details;
    return out;
  } catch {
    return null;
  }
}

export type EnsureReady = () => void | Promise<void>;

let ensureReady: EnsureReady = () => {};

/**
 * Allows apps (e.g. Next.js) to register a wasm initialization hook.
 * The generated API functions will call this before touching wasm objects.
 */
export function setEnsureReady(fn: EnsureReady) {
  ensureReady = fn;
}

export async function ensureReadyNow() {
  await ensureReady();
}

export type Freeable = { free: () => void };

export type TextLatexable = { toString: () => string; toLatex: () => string };

export type OutputTextLatex = {
  outputText: string;
  outputLatex: string;
};

export type SimplifyResult = OutputTextLatex & {
  inputLatex: string;
};

export function requireTrimmed(text: string, emptyMessage: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error(emptyMessage);
  return trimmed;
}

export function safeFree(obj: Freeable | null | undefined) {
  if (!obj) return;
  try {
    obj.free();
  } catch {
    // ignore (may already be consumed)
  }
}

export async function withReady<R>(fn: () => R | Promise<R>) {
  await ensureReadyNow();
  return await fn();
}

export async function withObject<T extends Freeable, R>(factory: () => T, use: (obj: T) => R | Promise<R>) {
  return await withReady(async () => {
    const obj = factory();
    try {
      return await use(obj);
    } finally {
      safeFree(obj);
    }
  });
}

export async function withObjects<T extends Freeable, R>(
  factories: Array<() => T>,
  use: (objs: T[]) => R | Promise<R>,
) {
  return await withReady(async () => {
    const objs: T[] = [];
    try {
      for (const factory of factories) objs.push(factory());
      return await use(objs);
    } finally {
      for (const obj of objs) safeFree(obj);
    }
  });
}

export function toOutputTextLatex(obj: TextLatexable): OutputTextLatex {
  return {
    outputText: obj.toString(),
    outputLatex: obj.toLatex(),
  };
}
