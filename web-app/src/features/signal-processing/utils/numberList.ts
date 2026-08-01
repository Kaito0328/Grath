export function parseNumberList(text: string): { values: number[]; error?: string } {
	const tokens = text
		.split(/[\s,]+/)
		.map((t) => t.trim())
		.filter((t) => t.length > 0);

	if (tokens.length === 0) return { values: [] };

	const values: number[] = [];
	for (const token of tokens) {
		const n = Number(token);
		if (!Number.isFinite(n)) {
			return { values: [], error: `数値として解釈できません: ${token}` };
		}
		values.push(Object.is(n, -0) ? 0 : n);
	}

	return { values };
}

function formatNumber(x: number): string {
	if (Object.is(x, -0)) return "0";
	if (!Number.isFinite(x)) return "0";
	if (Number.isInteger(x)) return String(x);
	return String(parseFloat(x.toPrecision(12)));
}

export function formatNumberList(values: ArrayLike<number>): string {
	const out: string[] = [];
	for (let i = 0; i < values.length; i++) out.push(formatNumber(values[i] ?? 0));
	return out.join(", ");
}
