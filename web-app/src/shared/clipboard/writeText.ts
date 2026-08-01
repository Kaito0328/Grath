export async function writeClipboardText(text: string) {
  if (typeof navigator === "undefined") {
    throw new Error("Clipboard is not available in this environment.");
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  throw new Error("Clipboard API is not available.");
}
