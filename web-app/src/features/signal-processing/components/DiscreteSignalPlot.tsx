import { useMemo } from "react";

export type DiscreteSignalPlotProps = {
	values: number[];
	height?: number;
	maxPoints?: number;
	className?: string;
	showAxisNumbers?: boolean;
};

function formatTick(v: number): string {
	if (!Number.isFinite(v)) return "-";
	if (v === 0) return "0";
	const abs = Math.abs(v);
	let s: string;
	if (abs >= 1000 || abs < 0.01) s = v.toExponential(2);
	else if (abs >= 100) s = v.toFixed(0);
	else if (abs >= 10) s = v.toFixed(1);
	else s = v.toFixed(2);
	// trim trailing zeros like 1.00 -> 1, 1.20 -> 1.2
	if (s.includes(".")) s = s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
	return s;
}

function downsample(values: number[], maxPoints: number): number[] {
	if (values.length <= maxPoints) return values;
	const step = Math.ceil(values.length / maxPoints);
	const out: number[] = [];
	for (let i = 0; i < values.length; i += step) out.push(values[i] ?? 0);
	if (out.length === 0) return [];
	if (out[out.length - 1] !== values[values.length - 1]) out.push(values[values.length - 1] ?? 0);
	return out;
}

export function DiscreteSignalPlot({ values, height = 160, maxPoints = 400, className, showAxisNumbers = true }: DiscreteSignalPlotProps) {
	const data = useMemo(() => downsample(values, maxPoints), [values, maxPoints]);

	const { yMin, yMax } = useMemo(() => {
		if (data.length === 0) return { yMin: -1, yMax: 1 };
		let min = data[0] ?? 0;
		let max = data[0] ?? 0;
		for (const v of data) {
			if (v < min) min = v;
			if (v > max) max = v;
		}
		if (min === max) {
			min -= 1;
			max += 1;
		}
		return { yMin: min, yMax: max };
	}, [data]);

	const W = 1000;
	const H = 200;
	const pad = 24;
	const innerW = W - pad * 2;
	const innerH = H - pad * 2;

	const xMinLabel = "0";
	const xMaxLabel = values.length > 0 ? String(values.length - 1) : "0";

	const points = useMemo(() => {
		const n = data.length;
		if (n === 0) return [] as Array<{ x: number; y: number }>;

		const den = yMax - yMin;
		const scaleY = den === 0 ? 1 : innerH / den;

		return data.map((v, i) => {
			const t = n === 1 ? 0.5 : i / (n - 1);
			const x = pad + t * innerW;
			const y = pad + (yMax - v) * scaleY;
			return { x, y };
		});
	}, [data, yMin, yMax, innerH, innerW]);

	const zeroY = useMemo(() => {
		if (!(yMin <= 0 && 0 <= yMax)) return null;
		const den = yMax - yMin;
		if (den === 0) return null;
		return pad + (yMax - 0) * (innerH / den);
	}, [yMin, yMax, innerH]);

	return (
		<svg
			width="100%"
			height={height}
			viewBox={`0 0 ${W} ${H}`}
			preserveAspectRatio="none"
			className={className}
			role="img"
		>
			<rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="none" stroke="currentColor" opacity={0.25} />
			{zeroY !== null ? (
				<line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="currentColor" opacity={0.25} />
			) : null}
			{showAxisNumbers ? (
				<g fill="currentColor" opacity={0.55} style={{ fontSize: 14 }}>
					{/* x-axis numbers (inside plot) */}
					<text x={pad} y={H - 6} textAnchor="start" dominantBaseline="ideographic">
						{xMinLabel}
					</text>
					<text x={W - pad} y={H - 6} textAnchor="end" dominantBaseline="ideographic">
						{xMaxLabel}
					</text>

					{/* y-axis numbers (inside plot) */}
					<text x={6} y={pad} textAnchor="start" dominantBaseline="hanging">
						{formatTick(yMax)}
					</text>
					<text x={6} y={H - pad} textAnchor="start" dominantBaseline="ideographic">
						{formatTick(yMin)}
					</text>
					{zeroY !== null ? (
						<text x={6} y={zeroY - 2} textAnchor="start" dominantBaseline="ideographic">
							0
						</text>
					) : null}
				</g>
			) : null}
			{points.map((p, idx) => (
				<circle key={idx} cx={p.x} cy={p.y} r={3} fill="currentColor" />
			))}
		</svg>
	);
}
