"use client";

import { useMemo, useState } from "react";
import { Modal } from "../../../design/baseComponents/Modal";
import { Stack } from "../../../design/primitives/Stack";
import { Text } from "../../../design/baseComponents/Text";
import { Select } from "../../../design/baseComponents/Select";
import { Input } from "../../../design/baseComponents/Input";
import { Button } from "../../../design/baseComponents/Button";
import { Markdown } from "../../../design/baseComponents/Markdown";
import { formatNumberList } from "../utils/numberList";

export type SignalWaveform = "sin" | "cos" | "square" | "impulse" | "step";

type ComponentWaveform = SignalWaveform;
type NoiseType = "none" | "uniform" | "gaussian";

export interface SignalGeneratorModalProps {
	open: boolean;
	onClose: () => void;
	onApply: (text: string) => void;
}

const TAU = 2 * Math.PI;

function formatNum(x: number, digits = 6): string {
	if (!Number.isFinite(x)) return "NaN";
	const scale = 10 ** digits;
	const rounded = Math.round(x * scale) / scale;
	const s = String(rounded);
	return s === "-0" ? "0" : s;
}

function buildSignedSum(terms: Array<{ sign: 1 | -1; body: string }>): string {
	if (terms.length === 0) return "0";
	let out = "";
	for (let i = 0; i < terms.length; i++) {
		const t = terms[i];
		if (i === 0) {
			out += t.sign === -1 ? `-${t.body}` : t.body;
			continue;
		}
		out += t.sign === -1 ? ` - ${t.body}` : ` + ${t.body}`;
	}
	return out;
}

function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function randn(rng: () => number): number {
	let u = 0;
	let v = 0;
	while (u === 0) u = rng();
	while (v === 0) v = rng();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

function generateToneSample(waveform: Exclude<ComponentWaveform, "impulse" | "step">, phase: number): number {
	if (waveform === "sin") return Math.sin(phase);
	if (waveform === "cos") return Math.cos(phase);
	return Math.sin(phase) >= 0 ? 1 : -1;
}

export const SignalGeneratorModal = ({ open, onClose, onApply }: SignalGeneratorModalProps) => {
	const [fsText, setFsText] = useState("1000");
	const [tText, setTText] = useState("1");
	const [offsetText, setOffsetText] = useState("0");
	const [noiseType, setNoiseType] = useState<NoiseType>("none");
	const [noiseLevelText, setNoiseLevelText] = useState("0.1");
	const [seedText, setSeedText] = useState("0");
	const [components, setComponents] = useState<
		Array<{ id: string; waveform: ComponentWaveform; ampText: string; fText: string; phaseText: string }>
	>(() => [
		{ id: "0", waveform: "sin", ampText: "1", fText: "10", phaseText: "0" },
	]);
	const [error, setError] = useState<string | null>(null);

	const fs = useMemo(() => Number(fsText), [fsText]);
	const T = useMemo(() => Number(tText), [tText]);
	const offset = useMemo(() => Number(offsetText), [offsetText]);
	const noiseLevel = useMemo(() => Number(noiseLevelText), [noiseLevelText]);
	const seed = useMemo(() => Number(seedText), [seedText]);

	const N = useMemo(() => {
		if (!Number.isFinite(fs) || !Number.isFinite(T) || fs <= 0 || T <= 0) return 0;
		return Math.floor(fs * T);
	}, [fs, T]);

	const formula = useMemo(() => {
		const maxTerms = 4;
		const terms: Array<{ sign: 1 | -1; body: string }> = [];

		const fsOk = Number.isFinite(fs) && fs > 0;
		const TOk = Number.isFinite(T) && T > 0;
		const nOk = fsOk && TOk;
		const NComputed = nOk ? Math.floor(fs * T) : 0;
		const offsetOk = Number.isFinite(offset);
		const offsetIsZero = offsetOk && offset === 0;
		const offsetL = offsetOk ? formatNum(offset) : "c_0";

		function ampToSignedTerm(amp: number, expr: string): { sign: 1 | -1; body: string } | null {
			if (!Number.isFinite(amp) || amp === 0) return null;
			const sign: 1 | -1 = amp < 0 ? -1 : 1;
			const a = Math.abs(amp);
			if (a === 1) return { sign, body: expr };
			return { sign, body: `${formatNum(a)}\\,${expr}` };
		}

		function argLatexForTone(cf: number, phi: number): string {
			// 2\pi は維持しつつ、f/fs は可能なら簡約して表示する
			const cfOk = Number.isFinite(cf);
			const fsOk2 = Number.isFinite(fs) && fs > 0;
			const ratioPart = cfOk && fsOk2 ? formatNum(cf / fs) : `${cfOk ? formatNum(cf) : "f"}/${fsOk2 ? formatNum(fs) : "f_s"}`;
			const base = `2\\pi\\,${ratioPart}\\,n`;
			const phiOk = Number.isFinite(phi);
			const phiIsZero = phiOk && phi === 0;
			const phiL = phiOk ? formatNum(phi) : "\\phi";
			return phiIsZero ? base : `${base} + ${phiL}`;
		}

		for (const c of components.slice(0, maxTerms)) {
			const amp = Number(c.ampText);
			if (c.waveform === "impulse") {
				const t = ampToSignedTerm(amp, "\\delta[n]");
				if (t) terms.push(t);
				continue;
			}
			if (c.waveform === "step") {
				const t = ampToSignedTerm(amp, "u[n]");
				if (t) terms.push(t);
				continue;
			}
			const cf = Number(c.fText);
			const phi = Number(c.phaseText);
			const cfOk = Number.isFinite(cf);
			const arg = cfOk ? argLatexForTone(cf, phi) : "\\omega\\,n + \\phi";
			const expr =
				c.waveform === "sin"
					? `\\sin\\left(${arg}\\right)`
					: c.waveform === "cos"
						? `\\cos\\left(${arg}\\right)`
						: `\\operatorname{sgn}\\left(\\sin\\left(${arg}\\right)\\right)`;
			const t = ampToSignedTerm(amp, expr);
			if (t) terms.push(t);
		}

		const sumPart = buildSignedSum(terms);
		const etc = components.length > maxTerms ? " + \\cdots" : "";
		const noisePart = (() => {
			if (noiseType === "none") return "";
			if (noiseType === "uniform") {
				const a = Number(noiseLevelText);
				const aL = Number.isFinite(a) ? formatNum(a) : "a";
				return ` + e[n],\\;e[n]\\sim\\mathcal{U}(-${aL},${aL})`;
			}
			const s = Number(noiseLevelText);
			const sL = Number.isFinite(s) ? formatNum(s) : "\\sigma";
			return ` + e[n],\\;e[n]\\sim\\mathcal{N}(0,${sL}^2)`;
		})();

		const base = terms.length > 0 ? `\\left(${sumPart}${etc}\\right)` : "0";
		const withOffset = offsetIsZero ? base : `${offsetL} + ${base}`;
		const rangePart = nOk
			? (() => {
				const end = Math.max(0, NComputed - 1);
				return `0\\le n \\le ${end}`;
			})()
			: `0\\le n < \\lfloor f_s T\\rfloor`;

		return ["$$", `x[n] = ${withOffset}${noisePart},\\quad ${rangePart}`, "$$"].join("\n");
	}, [components, fs, noiseLevelText, noiseType, offset, T]);

	function addComponent() {
		setComponents((prev) => {
			const nextId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
			return [...prev, { id: nextId, waveform: "sin", ampText: "1", fText: "10", phaseText: "0" }];
		});
	}

	function removeComponent(id: string) {
		setComponents((prev) => prev.filter((c) => c.id !== id));
	}

	function onGenerate() {
		setError(null);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は 0 より大きい数値にしてください。");
		if (!Number.isFinite(T) || T <= 0) return setError("T は 0 より大きい数値にしてください。");
		if (N <= 0) return setError("N が 0 になっています（fs と T を見直してください）。");
		if (!Number.isFinite(offset)) return setError("offset は数値にしてください。");

		const nyq = fs / 2;
		if (components.length === 0) return setError("成分が 0 です（1つ以上追加してください）。");
		for (const c of components) {
			const amp = Number(c.ampText);
			if (!Number.isFinite(amp)) return setError("A は数値にしてください。");
			if (c.waveform === "impulse" || c.waveform === "step") continue;
			const cf = Number(c.fText);
			const phase0 = Number(c.phaseText);
			if (!Number.isFinite(cf) || cf < 0) return setError("f は 0 以上の数値にしてください。");
			if (cf > nyq) return setError("f はナイキスト周波数（fs/2）以下にしてください。");
			if (!Number.isFinite(phase0)) return setError("phase は数値にしてください。");
		}

		if (noiseType !== "none") {
			if (!Number.isFinite(noiseLevel) || noiseLevel < 0) {
				return setError("noise は 0 以上の数値にしてください。");
			}
			if (!Number.isFinite(seed)) return setError("seed は数値にしてください。");
		}

		const out = new Float64Array(Math.max(0, N));
		if (N <= 0) return;

		for (let n = 0; n < N; n++) {
			out[n] = offset;
		}

		for (let n = 0; n < N; n++) {
			let sum = 0;
			for (const c of components) {
				const amp = Number(c.ampText);
				if (c.waveform === "step") {
					sum += amp;
					continue;
				}
				if (c.waveform === "impulse") {
					sum += n === 0 ? amp : 0;
					continue;
				}
				const cf = Number(c.fText);
				const phase0 = Number(c.phaseText);
				const phase = TAU * cf * (n / fs) + phase0;
				sum += amp * generateToneSample(c.waveform, phase);
			}
			out[n] += sum;
		}

		if (noiseType !== "none" && noiseLevel > 0) {
			const rng = mulberry32(seed);
			for (let n = 0; n < N; n++) {
				const z = noiseType === "gaussian" ? randn(rng) * noiseLevel : (rng() * 2 - 1) * noiseLevel;
				out[n] += z;
			}
		}

		const arr = out;
		onApply(formatNumberList(arr));
		onClose();
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="信号を生成"
			size="xl"
			footer={
				<Stack gap="sm" className="w-full">
					<Markdown bg="transparent" padding="none" className="text-sm [&>p]:m-0">
						{formula}
					</Markdown>
					<Stack direction="row" gap="sm" className="justify-end w-full">
						<Button variant="outline" onClick={onClose}>
							キャンセル
						</Button>
						<Button onClick={onGenerate}>生成</Button>
					</Stack>
				</Stack>
			}
		>
			<Stack gap="md">
				<Stack gap="sm">
					<Text color="muted">入力（合成）</Text>
					<Stack gap="sm">
						<Stack direction="row" gap="sm" className="items-center justify-between">
							<Text color="muted">成分</Text>
							<Button variant="outline" onClick={addComponent}>
								成分を追加
							</Button>
						</Stack>
						{components.map((c) => (
							<Stack key={c.id} gap="sm" className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
								<Stack direction="row" gap="sm" className="items-end flex-wrap">
									<Stack gap="xs" className="flex-1 min-w-[140px]">
										<Text color="muted">wave</Text>
										<Select
											value={c.waveform}
											onChange={(e) =>
												setComponents((prev) =>
													prev.map((p) => (p.id === c.id ? { ...p, waveform: e.target.value as ComponentWaveform } : p)),
												)
											}
											options={[
												{ value: "sin", label: "sin" },
												{ value: "cos", label: "cos" },
												{ value: "square", label: "square" },
												{ value: "impulse", label: "impulse" },
												{ value: "step", label: "step" },
											]}
										/>
									</Stack>
									<Stack gap="xs" className="flex-1 min-w-[120px]">
										<Text color="muted">A</Text>
										<Input
											value={c.ampText}
											onChange={(e) =>
												setComponents((prev) =>
													prev.map((p) => (p.id === c.id ? { ...p, ampText: e.target.value } : p)),
												)
											}
											placeholder="例: 1"
										/>
									</Stack>
									{c.waveform !== "impulse" && c.waveform !== "step" ? (
										<>
											<Stack gap="xs" className="flex-1 min-w-[140px]">
												<Text color="muted">f (Hz)</Text>
												<Input
													value={c.fText}
													onChange={(e) =>
														setComponents((prev) =>
															prev.map((p) => (p.id === c.id ? { ...p, fText: e.target.value } : p)),
														)
													}
													placeholder="例: 10"
												/>
											</Stack>
											<Stack gap="xs" className="flex-1 min-w-[160px]">
												<Text color="muted">phase (rad)</Text>
												<Input
													value={c.phaseText}
													onChange={(e) =>
														setComponents((prev) =>
															prev.map((p) => (p.id === c.id ? { ...p, phaseText: e.target.value } : p)),
														)
													}
													placeholder="例: 0"
												/>
											</Stack>
										</>
									) : null}
									<Button variant="outline" onClick={() => removeComponent(c.id)}>
										削除
									</Button>
								</Stack>
							</Stack>
						))}
					</Stack>
				</Stack>

				<Stack gap="sm">
					<Text color="muted">fs（サンプリング周波数）</Text>
					<Input value={fsText} onChange={(e) => setFsText(e.target.value)} placeholder="例: 1000" />
				</Stack>

				<Stack gap="sm">
					<Text color="muted">T（秒）</Text>
					<Input value={tText} onChange={(e) => setTText(e.target.value)} placeholder="例: 1" />
				</Stack>

				<Stack gap="sm">
					<Text color="muted">offset（DC）</Text>
					<Input value={offsetText} onChange={(e) => setOffsetText(e.target.value)} placeholder="例: 0" />
				</Stack>

				<Stack gap="sm">
					<Text color="muted">ノイズ</Text>
					<Select
						value={noiseType}
						onChange={(e) => setNoiseType(e.target.value as NoiseType)}
						options={[
							{ value: "none", label: "なし" },
							{ value: "uniform", label: "一様（[-a, a]）" },
							{ value: "gaussian", label: "ガウス（平均0, σ）" },
						]}
					/>
				</Stack>

				{noiseType !== "none" ? (
					<Stack gap="sm">
						<Text color="muted">noise level（uniform: a / gaussian: σ）</Text>
						<Input value={noiseLevelText} onChange={(e) => setNoiseLevelText(e.target.value)} placeholder="例: 0.1" />
					</Stack>
				) : null}

				{noiseType !== "none" ? (
					<Stack gap="sm">
						<Text color="muted">seed（再現性）</Text>
						<Input value={seedText} onChange={(e) => setSeedText(e.target.value)} placeholder="例: 0" />
					</Stack>
				) : null}

				{error ? <Text color="danger">{error}</Text> : null}
			</Stack>
		</Modal>
	);
};
