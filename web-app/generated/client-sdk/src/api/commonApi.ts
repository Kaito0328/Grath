/* eslint-disable */
/* tslint:disable */
// --- Auto-generated: client-sdk API classes (common) ---

import * as W from "../wrappers/common";
import { requireTrimmed, withReady } from "./runtime";

// DTOs (serializable shapes). The classes below store these DTOs internally.


// Shared helpers
function requireSafeInteger(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} must be a safe integer`);
  return String(Math.floor(n));
}


