export const parseBits01 = (input: string): Uint8Array => {
	const s = input.trim();
	if (s.length === 0) return new Uint8Array();

	// Accept: "1011" or "1,0,1,1" or "1 0 1 1" (and mixed whitespace)
	const compact = s.replace(/[\s,]/g, "");
	if (/^[01]+$/.test(compact)) {
		return Uint8Array.from(compact.split("").map((c) => (c === "1" ? 1 : 0)));
	}

	const tokens = s.split(/[^01]+/g).filter(Boolean);
	if (tokens.length === 0) {
		throw new Error("ビット列は 0/1 で入力してください");
	}
	return Uint8Array.from(tokens.map((t) => (t === "1" ? 1 : 0)));
};

export const bitsToCsv = (bits: Uint8Array): string => {
	return Array.from(bits).join(",");
};

export const bytesToBitsMsb = (bytes: Uint8Array): Uint8Array => {
	const bits = new Uint8Array(bytes.length * 8);
	let idx = 0;
	for (const b of bytes) {
		for (let bit = 7; bit >= 0; bit--) {
			bits[idx++] = (b >> bit) & 1;
		}
	}
	return bits;
};

export const bitsMsbToBytes = (bits: Uint8Array): Uint8Array => {
	if (bits.length % 8 !== 0) {
		throw new Error("ビット長は 8 の倍数である必要があります");
	}
	const bytes = new Uint8Array(bits.length / 8);
	for (let i = 0; i < bytes.length; i++) {
		let b = 0;
		for (let j = 0; j < 8; j++) {
			b = (b << 1) | (bits[i * 8 + j] & 1);
		}
		bytes[i] = b;
	}
	return bytes;
};

export const flipBitsBsc = (bits: Uint8Array, p: number): { out: Uint8Array; flipped: number } => {
	if (!Number.isFinite(p) || p < 0 || p > 1) {
		throw new Error("誤り確率 p は 0〜1 の範囲で指定してください");
	}
	let flipped = 0;
	const out = new Uint8Array(bits.length);
	for (let i = 0; i < bits.length; i++) {
		const bit = bits[i] & 1;
		const doFlip = Math.random() < p;
		if (doFlip) flipped++;
		out[i] = doFlip ? (bit ^ 1) : bit;
	}
	return { out, flipped };
};

export const flipBitsInBytesBsc = (bytes: Uint8Array, p: number): { out: Uint8Array; flipped: number; totalBits: number } => {
	if (!Number.isFinite(p) || p < 0 || p > 1) {
		throw new Error("誤り確率 p は 0〜1 の範囲で指定してください");
	}
	const out = new Uint8Array(bytes);
	let flipped = 0;
	for (let i = 0; i < out.length; i++) {
		let b = out[i];
		for (let bit = 0; bit < 8; bit++) {
			if (Math.random() < p) {
				b ^= 1 << bit;
				flipped++;
			}
		}
		out[i] = b;
	}
	return { out, flipped, totalBits: out.length * 8 };
};
