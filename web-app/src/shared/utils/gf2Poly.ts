export const trimDegreeGF2 = (coeffs: Uint8Array): number => {
	for (let i = coeffs.length - 1; i >= 0; i--) {
		if ((coeffs[i] & 1) !== 0) return i;
	}
	return -1;
};

export const polyDivRemGF2 = (
	dividend: Uint8Array,
	divisor: Uint8Array
): { quotient: Uint8Array; remainder: Uint8Array } => {
	const degD = trimDegreeGF2(dividend);
	const degG = trimDegreeGF2(divisor);
	if (degG < 0) throw new Error("divisor must be non-zero");
	if (degD < degG) {
		return {
			quotient: new Uint8Array(),
			remainder: Uint8Array.from(dividend, (x) => x & 1),
		};
	}

	const work = Uint8Array.from(dividend, (x) => x & 1);
	const quotient = new Uint8Array(degD - degG + 1);

	for (let i = degD; i >= degG; i--) {
		if ((work[i] & 1) === 0) continue;
		const qi = i - degG;
		quotient[qi] = 1;
		for (let j = 0; j <= degG; j++) {
			work[qi + j] ^= divisor[j] & 1;
		}
	}

	// remainder degree < degG
	const rem = work.slice(0, degG);
	return { quotient, remainder: rem };
};

export const polyXnPlus1GF2 = (n: number): Uint8Array => {
	if (!Number.isInteger(n) || n <= 0) throw new Error("n must be a positive integer");
	const out = new Uint8Array(n + 1);
	out[0] = 1;
	out[n] = 1;
	return out;
};

export const validateGeneratorPolynomialDividesXnPlus1GF2 = (n: number, g: Uint8Array): string | null => {
	if (!Number.isInteger(n) || n <= 0) return "n は正の整数で指定してください";
	const degG = trimDegreeGF2(g);
	if (degG < 0) return "g(x) は 0 ではいけません";
	if (degG > n) return `deg(g)=${degG} は n=${n} 以下である必要があります`;
	if ((g[0] & 1) === 0) return "g(x) の定数項は 1 である必要があります";
	if ((g[degG] & 1) === 0) return "g(x) は monic（最高次係数=1）である必要があります";

	// Cyclic code over GF(2) usually assumes g(x) | (x^n - 1). Over GF(2), x^n-1 == x^n+1.
	const xn1 = polyXnPlus1GF2(n);
	const { remainder } = polyDivRemGF2(xn1, g);
	for (let i = 0; i < remainder.length; i++) {
		if ((remainder[i] & 1) !== 0) return "g(x) は x^n+1 を割り切る必要があります（巡回符号の条件）";
	}
	return null;
};

// ---- Primitive (maximal-period) modulus check for GF(2^m) ----

// Checks that the recurrence used to build exp/log tables generates all non-zero m-bit states
// exactly once (period 2^m-1). This matches the assumption in the Rust FiniteField2m tables.
export const isPrimitiveModulusGF2 = (px: Uint8Array): boolean => {
	if (px.length < 3) return false;
	const m = px.length - 1;
	if (!Number.isInteger(m) || m < 2 || m > 15) return false;
	if ((px[0] & 1) === 0) return false;
	if ((px[m] & 1) === 0) return false;

	let pxBits = 0;
	for (let i = 0; i < px.length; i++) {
		if ((px[i] & 1) !== 0) pxBits |= 1 << i;
	}

	const n = (1 << m) - 1;
	const primLow = pxBits & ~(1 << m); // remove x^m term
	const mask = (1 << m) - 1;
	const seen = new Uint8Array(1 << m);

	let x = 1;
	for (let i = 0; i < n; i++) {
		if (x === 0) return false;
		if (seen[x]) return false;
		seen[x] = 1;
		const carry = (x & (1 << (m - 1))) !== 0;
		x = (x << 1) & mask;
		if (carry) x ^= primLow;
	}

	if (x !== 1) return false;
	for (let v = 1; v < (1 << m); v++) {
		if (!seen[v]) return false;
	}
	return true;
};
