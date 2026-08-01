export type KindLabel = {
	symbol: string;
	en: string;
	ja: string;
};

export type KindLabelMap = Record<string, KindLabel>;

export function getKindLabel(map: KindLabelMap, kind: string): KindLabel | null {
	return map[kind] ?? null;
}

export function formatKindLabel(map: KindLabelMap, kind: string) {
	const k = getKindLabel(map, kind);
	if (!k) return kind;
	return `${k.symbol}: ${k.en} / ${k.ja}`;
}

export function formatKindLabelPlain(map: KindLabelMap, kind: string) {
	const k = getKindLabel(map, kind);
	if (!k) return kind;
	return `${k.en} / ${k.ja}`;
}

export function formatKindLabelEn(map: KindLabelMap, kind: string) {
	const k = getKindLabel(map, kind);
	if (!k) return kind;
	return k.en;
}
