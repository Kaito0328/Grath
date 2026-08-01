export const normalizeHex = (hex: string): string => {
	return hex
		.trim()
		.replace(/^0x/i, "")
		.replace(/[\s\n\r\t]/g, "");
};

export const hexToBytes = (hex: string): Uint8Array => {
	const normalized = normalizeHex(hex);
	if (normalized.length === 0) return new Uint8Array();
	if (normalized.length % 2 !== 0) {
		throw new Error("hex の桁数は偶数である必要があります");
	}
	if (!/^[0-9a-fA-F]+$/.test(normalized)) {
		throw new Error("hex は 0-9 a-f のみ使用できます");
	}

	const out = new Uint8Array(normalized.length / 2);
	for (let i = 0; i < out.length; i++) {
		out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
	}
	return out;
};

export const bytesToHex = (bytes: Uint8Array): string => {
	let out = "";
	for (const b of bytes) {
		out += b.toString(16).padStart(2, "0");
	}
	return out;
};
