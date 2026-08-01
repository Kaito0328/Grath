"use client";

import { useMemo, useState } from "react";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { Button } from "../../design/baseComponents/Button";
import { Text } from "../../design/baseComponents/Text";
import { FormField } from "../../design/baseComponents/FormField";
import { Input } from "../../design/baseComponents/Input";
import { TextArea } from "../../design/baseComponents/TextArea";
import { SaveVariableIconButton } from "../../shared/variable-manager/SaveVariableIconButton";
import { Select } from "../../design/baseComponents/Select";
import { Modal } from "../../design/baseComponents/Modal";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";

import { SignalProcessingApi } from "@my-project/client-sdk";
import { SignalArrayField } from "./components/SignalArrayField";
import { DiscreteSignalPlot } from "./components/DiscreteSignalPlot";
import { formatNumberList, parseNumberList } from "./utils/numberList";

const SIGNAL_KIND = "signalProcessing.signal";

type LabState = {
	inMagText: string;
	filteredText: string;
	filteredMagText: string;
	downText: string;
	downMagText: string;
	upText: string;
	upMagText: string;
	reconText: string;
	reconMagText: string;
	diffText: string;
};

type FilterMode = "none" | "fir" | "fir_design" | "iir_butterworth" | "iir_chebyshev1" | "iir_chebyshev2";
type WindowType = "hann" | "hamming" | "blackman" | "rectangular" | "kaiser";

function halfSpectrumText(magnitudes: number[], n: number): string {
	const halfLen = Math.floor(n / 2) + 1;
	return formatNumberList(magnitudes.slice(0, halfLen));
}

function firApplyCausalSame(x: number[], h: number[]): number[] {
	const n = x.length;
	const m = h.length;
	const y = new Array<number>(n).fill(0);
	for (let i = 0; i < n; i++) {
		let acc = 0;
		for (let k = 0; k < m; k++) {
			const xi = i - k;
			if (xi < 0) break;
			acc += h[k] * x[xi];
		}
		y[i] = acc;
	}
	return y;
}

function rmse(a: number[], b: number[]): number {
	const n = Math.min(a.length, b.length);
	if (n <= 0) return 0;
	let s = 0;
	for (let i = 0; i < n; i++) {
		const d = a[i] - b[i];
		s += d * d;
	}
	return Math.sqrt(s / n);
}

function maxAbsDiff(a: number[], b: number[]): number {
	const n = Math.min(a.length, b.length);
	let m = 0;
	for (let i = 0; i < n; i++) {
		const d = Math.abs(a[i] - b[i]);
		if (d > m) m = d;
	}
	return m;
}

export const AliasingLab = () => {
	const [fsText, setFsText] = useState("1000");
	const [factorText, setFactorText] = useState("2");
	const [inText, setInText] = useState("0, 1, 0, -1, 0, 1, 0, -1");
	const [preFilterMode, setPreFilterMode] = useState<FilterMode>("fir_design");
	const [preCutoffHzText, setPreCutoffHzText] = useState("200");
	const [preNumTapsText, setPreNumTapsText] = useState("101");
	const [preWindowType, setPreWindowType] = useState<WindowType>("hamming");
	const [preKaiserBetaText, setPreKaiserBetaText] = useState("8.6");
	const [preIirOrderText, setPreIirOrderText] = useState("6");
	const [preRippleDbText, setPreRippleDbText] = useState("1");
	const [preStopAttenDbText, setPreStopAttenDbText] = useState("40");
	const [preTapsText, setPreTapsText] = useState("0.25, 0.5, 0.25");

	const [reconFilterMode, setReconFilterMode] = useState<FilterMode>("fir_design");
	const [reconCutoffHzText, setReconCutoffHzText] = useState("200");
	const [reconNumTapsText, setReconNumTapsText] = useState("101");
	const [reconWindowType, setReconWindowType] = useState<WindowType>("hamming");
	const [reconKaiserBetaText, setReconKaiserBetaText] = useState("8.6");
	const [reconIirOrderText, setReconIirOrderText] = useState("6");
	const [reconRippleDbText, setReconRippleDbText] = useState("1");
	const [reconStopAttenDbText, setReconStopAttenDbText] = useState("40");
	const [reconTapsText, setReconTapsText] = useState("0.25, 0.5, 0.25");
	const [preLpfModalOpen, setPreLpfModalOpen] = useState(false);
	const [reconLpfModalOpen, setReconLpfModalOpen] = useState(false);
	const [lab, setLab] = useState<LabState>({
		inMagText: "",
		filteredText: "",
		filteredMagText: "",
		downText: "",
		downMagText: "",
		upText: "",
		upMagText: "",
		reconText: "",
		reconMagText: "",
		diffText: "",
	});
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preDesignError, setPreDesignError] = useState<string | null>(null);
	const [reconDesignError, setReconDesignError] = useState<string | null>(null);

	function resetFromInput() {
		setLab({
			inMagText: "",
			filteredText: "",
			filteredMagText: "",
			downText: "",
			downMagText: "",
			upText: "",
			upMagText: "",
			reconText: "",
			reconMagText: "",
			diffText: "",
		});
	}

	function resetFromPreLpf() {
		setLab((prev) => ({
			...prev,
			filteredText: "",
			filteredMagText: "",
			downText: "",
			downMagText: "",
			upText: "",
			upMagText: "",
			reconText: "",
			reconMagText: "",
			diffText: "",
		}));
	}

	function resetFromDown() {
		setLab((prev) => ({
			...prev,
			downText: "",
			downMagText: "",
			upText: "",
			upMagText: "",
			reconText: "",
			reconMagText: "",
			diffText: "",
		}));
	}

	function resetFromReconLpf() {
		setLab((prev) => ({
			...prev,
			reconText: "",
			reconMagText: "",
			diffText: "",
		}));
	}

	const inParsed = useMemo(() => parseNumberList(inText), [inText]);
	const preTapsParsed = useMemo(() => parseNumberList(preTapsText), [preTapsText]);
	const reconTapsParsed = useMemo(() => parseNumberList(reconTapsText), [reconTapsText]);
	const inMagParsed = useMemo(() => parseNumberList(lab.inMagText), [lab.inMagText]);
	const filteredParsed = useMemo(() => parseNumberList(lab.filteredText), [lab.filteredText]);
	const filteredMagParsed = useMemo(() => parseNumberList(lab.filteredMagText), [lab.filteredMagText]);
	const downParsed = useMemo(() => parseNumberList(lab.downText), [lab.downText]);
	const downMagParsed = useMemo(() => parseNumberList(lab.downMagText), [lab.downMagText]);
	const upParsed = useMemo(() => parseNumberList(lab.upText), [lab.upText]);
	const upMagParsed = useMemo(() => parseNumberList(lab.upMagText), [lab.upMagText]);
	const reconParsed = useMemo(() => parseNumberList(lab.reconText), [lab.reconText]);
	const reconMagParsed = useMemo(() => parseNumberList(lab.reconMagText), [lab.reconMagText]);
	const diffParsed = useMemo(() => parseNumberList(lab.diffText), [lab.diffText]);

	const nIn = !inParsed.error ? inParsed.values.length : null;
	const nRecon = !reconParsed.error ? reconParsed.values.length : null;

	const diffRmse = useMemo(() => {
		if (inParsed.error || reconParsed.error) return null;
		if (inParsed.values.length === 0 || reconParsed.values.length === 0) return null;
		return rmse(inParsed.values, reconParsed.values);
	}, [inParsed, reconParsed]);
	const diffMaxAbs = useMemo(() => {
		if (inParsed.error || reconParsed.error) return null;
		if (inParsed.values.length === 0 || reconParsed.values.length === 0) return null;
		return maxAbsDiff(inParsed.values, reconParsed.values);
	}, [inParsed, reconParsed]);

	async function designFirLowpassTaps(params: {
		cutoffHzText: string;
		numTapsText: string;
		windowType: WindowType;
		kaiserBetaText: string;
	}): Promise<{ ok: true; taps: number[] } | { ok: false; message: string }> {
		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return { ok: false, message: "fs は正の数にしてください。" };

		const cutoffHz = Number(params.cutoffHzText);
		if (!Number.isFinite(cutoffHz) || cutoffHz <= 0) return { ok: false, message: "cutoff は正の数にしてください。" };
		if (cutoffHz >= fs / 2) return { ok: false, message: "cutoff は fs/2 より小さくしてください。" };

		const numTaps = Number(params.numTapsText);
		if (!Number.isFinite(numTaps) || !Number.isInteger(numTaps) || numTaps <= 0) {
			return { ok: false, message: "numTaps は 1 以上の整数にしてください。" };
		}
		if (numTaps % 2 === 0) return { ok: false, message: "numTaps は奇数を推奨します（Type I）。" };

		const beta = Number(params.kaiserBetaText);
		if (!Number.isFinite(beta) || beta < 0) return { ok: false, message: "kaiser β は 0 以上の数値にしてください。" };

		try {
			const normalized = cutoffHz / fs;
			const taps = await SignalProcessingApi.designFirLowpassTaps(numTaps, normalized, params.windowType, beta);
			return { ok: true, taps };
		} catch (e) {
			console.error(e);
			return { ok: false, message: "taps の設計に失敗しました（詳細は console を確認してください）。" };
		}
	}

	function validateFilterConfig(prefix: "前段" | "復元", mode: FilterMode, cutoffHzText: string, iirOrderText: string, rippleDbText: string, stopAttenDbText: string, tapsParsed: ReturnType<typeof parseNumberList>) {
		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return "fs は正の数にしてください。";
		if (mode === "none") return null;
		if (mode === "fir" || mode === "fir_design") {
			if (tapsParsed.error) return `${prefix}: taps: ${tapsParsed.error}`;
			if (tapsParsed.values.length === 0) return `${prefix}: taps が空です。`;
			return null;
		}

		const cutoffHz = Number(cutoffHzText);
		if (!Number.isFinite(cutoffHz) || cutoffHz <= 0) return `${prefix}: cutoff は正の数にしてください。`;
		if (cutoffHz >= fs / 2) return `${prefix}: cutoff は fs/2 より小さくしてください。`;

		const order = Number(iirOrderText);
		if (!Number.isFinite(order) || !Number.isInteger(order) || order <= 0) {
			return `${prefix}: order は 1 以上の整数にしてください。`;
		}
		if (mode === "iir_chebyshev1") {
			const rippleDb = Number(rippleDbText);
			if (!Number.isFinite(rippleDb) || rippleDb <= 0) return `${prefix}: ripple(dB) は正の数にしてください。`;
		}
		if (mode === "iir_chebyshev2") {
			const attenDb = Number(stopAttenDbText);
			if (!Number.isFinite(attenDb) || attenDb <= 0) return `${prefix}: stop atten(dB) は正の数にしてください。`;
		}
		return null;
	}

	async function applyLpf(input: number[], cfg: {
		mode: FilterMode;
		cutoffHzText: string;
		iirOrderText: string;
		rippleDbText: string;
		stopAttenDbText: string;
		taps: number[];
	}): Promise<number[]> {
		const fs = Number(fsText);
		if (cfg.mode === "none") return input;
		const cutoffHz = Number(cfg.cutoffHzText);
		if (cfg.mode === "fir" || cfg.mode === "fir_design") {
			return firApplyCausalSame(input, cfg.taps);
		}
		const order = Number(cfg.iirOrderText);
		if (cfg.mode === "iir_butterworth") {
			return SignalProcessingApi.iirButterworthApply(input, fs, order, "lowpass", cutoffHz, 0);
		}
		if (cfg.mode === "iir_chebyshev1") {
			const rippleDb = Number(cfg.rippleDbText);
			return SignalProcessingApi.iirChebyshev1Apply(input, fs, order, rippleDb, "lowpass", cutoffHz, 0);
		}
		const attenDb = Number(cfg.stopAttenDbText);
		return SignalProcessingApi.iirChebyshev2Apply(input, fs, order, attenDb, "lowpass", cutoffHz, 0);
	}

	async function runPreLpf() {
		setError(null);
		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は正の数にしてください。");
		if (inParsed.error) return setError(`signal: ${inParsed.error}`);
		if (inParsed.values.length === 0) return setError("signal が空です。");

		const preErr = validateFilterConfig("前段", preFilterMode, preCutoffHzText, preIirOrderText, preRippleDbText, preStopAttenDbText, preTapsParsed);
		if (preErr) return setError(preErr);

		setBusy(true);
		try {
			const x = inParsed.values;
			const magsIn = await SignalProcessingApi.dftMagnitudes(x, fs);
			const xf = await applyLpf(x, {
				mode: preFilterMode,
				cutoffHzText: preCutoffHzText,
				iirOrderText: preIirOrderText,
				rippleDbText: preRippleDbText,
				stopAttenDbText: preStopAttenDbText,
				taps: preTapsParsed.values,
			});
			const magsF = await SignalProcessingApi.dftMagnitudes(xf, fs);

			setLab((prev) => ({
				...prev,
				inMagText: halfSpectrumText(magsIn, x.length),
				filteredText: formatNumberList(xf),
				filteredMagText: halfSpectrumText(magsF, xf.length),
				downText: "",
				downMagText: "",
				upText: "",
				upMagText: "",
				reconText: "",
				reconMagText: "",
				diffText: "",
			}));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	async function runDownsample() {
		setError(null);
		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は正の数にしてください。");
		const factor = Number(factorText);
		if (!Number.isFinite(factor) || !Number.isInteger(factor) || factor <= 0) {
			return setError("factor は 1 以上の整数にしてください。");
		}
		if (filteredParsed.error) return setError("まず 2) 前段 LPF を適用してください（または方式を「なし」にして適用してください）。");
		if (filteredParsed.values.length === 0) return setError("まず 2) 前段 LPF を適用してください（結果が空です）。");

		setBusy(true);
		try {
			const xf = filteredParsed.values;
			const xd = await SignalProcessingApi.decimate(xf, factor);
			const fsDown = fs / factor;
			const magsDown = await SignalProcessingApi.dftMagnitudes(xd, fsDown);
			setLab((prev) => ({
				...prev,
				downText: formatNumberList(xd),
				downMagText: halfSpectrumText(magsDown, xd.length),
				upText: "",
				upMagText: "",
				reconText: "",
				reconMagText: "",
				diffText: "",
			}));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	async function runUpsample() {
		setError(null);
		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は正の数にしてください。");
		const factor = Number(factorText);
		if (!Number.isFinite(factor) || !Number.isInteger(factor) || factor <= 0) {
			return setError("factor は 1 以上の整数にしてください。");
		}
		if (downParsed.error) return setError("まず 3) ↓ダウンサンプリング を実行してください。");
		if (downParsed.values.length === 0) return setError("まず 3) ↓ダウンサンプリング を実行してください（結果が空です）。");

		setBusy(true);
		try {
			const xd = downParsed.values;
			const xu = await SignalProcessingApi.expand(xd, factor);
			const magsUp = await SignalProcessingApi.dftMagnitudes(xu, fs);
			setLab((prev) => ({
				...prev,
				upText: formatNumberList(xu),
				upMagText: halfSpectrumText(magsUp, xu.length),
				reconText: "",
				reconMagText: "",
				diffText: "",
			}));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	async function runReconLpf() {
		setError(null);
		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は正の数にしてください。");
		if (inParsed.error) return setError(`signal: ${inParsed.error}`);
		if (inParsed.values.length === 0) return setError("signal が空です。");
		if (upParsed.error) return setError("まず 4) ↑アップサンプリング を実行してください。");
		if (upParsed.values.length === 0) return setError("まず 4) ↑アップサンプリング を実行してください（結果が空です）。");

		const reconErr = validateFilterConfig("復元", reconFilterMode, reconCutoffHzText, reconIirOrderText, reconRippleDbText, reconStopAttenDbText, reconTapsParsed);
		if (reconErr) return setError(reconErr);

		setBusy(true);
		try {
			const xu = upParsed.values;
			const xhat = await applyLpf(xu, {
				mode: reconFilterMode,
				cutoffHzText: reconCutoffHzText,
				iirOrderText: reconIirOrderText,
				rippleDbText: reconRippleDbText,
				stopAttenDbText: reconStopAttenDbText,
				taps: reconTapsParsed.values,
			});
			const magsRecon = await SignalProcessingApi.dftMagnitudes(xhat, fs);
			const x = inParsed.values;
			const L = Math.min(x.length, xhat.length);
			const diff = new Array<number>(L);
			for (let i = 0; i < L; i++) diff[i] = xhat[i] - x[i];
			setLab((prev) => ({
				...prev,
				reconText: formatNumberList(xhat),
				reconMagText: halfSpectrumText(magsRecon, xhat.length),
				diffText: formatNumberList(diff),
			}));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	function filterModeLabel(mode: FilterMode): string {
		if (mode === "none") return "なし";
		if (mode === "fir") return "FIR（taps 手入力）";
		if (mode === "fir_design") return "FIR（窓法で設計）";
		if (mode === "iir_butterworth") return "IIR（Butterworth）";
		if (mode === "iir_chebyshev1") return "IIR（Chebyshev I）";
		return "IIR（Chebyshev II）";
	}

	function filterSummary(prefix: "前段" | "復元", mode: FilterMode, cutoffHzText: string, tapsParsed: ReturnType<typeof parseNumberList>, orderText: string): string {
		if (mode === "none") return `${prefix}: なし`;
		if (mode === "fir" || mode === "fir_design") {
			const nTaps = tapsParsed.error ? "?" : String(tapsParsed.values.length);
			return `${prefix}: ${filterModeLabel(mode)} / taps ${nTaps}`;
		}
		const cutoff = Number(cutoffHzText);
		const cutoffLabel = Number.isFinite(cutoff) ? `${cutoff} Hz` : `${cutoffHzText} Hz`;
		return `${prefix}: ${filterModeLabel(mode)} / cutoff ${cutoffLabel} / order ${orderText}`;
	}

	const settingBlock = (
		<Stack gap="md">
			<Text color="muted">
				信号生成 →（LPF）→ ↓ダウンサンプリング → ↑アップサンプリング（0挿入）→（LPF）→ 復元、の流れを体験します。
			</Text>

			<Stack direction="row" gap="md" className="items-end flex-wrap">
				<FormField label="fs (Hz)">
					<Input
						value={fsText}
						onChange={(e) => {
							setFsText(e.target.value);
							resetFromInput();
						}}
						placeholder="例: 1000"
					/>
				</FormField>
				<FormField label="factor (M)">
					<Input
						value={factorText}
						onChange={(e) => {
							setFactorText(e.target.value);
							resetFromDown();
						}}
						placeholder="例: 2"
					/>
				</FormField>
				<View className="flex-1" />
				{nIn !== null ? <Text color="muted">N = {nIn}</Text> : null}
			</Stack>

			<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
				<Stack gap="sm">
					<Text color="muted">LPF（前段 + 復元）</Text>
					<Text color="muted">{filterSummary("前段", preFilterMode, preCutoffHzText, preTapsParsed, preIirOrderText)}</Text>
					<Text color="muted">{filterSummary("復元", reconFilterMode, reconCutoffHzText, reconTapsParsed, reconIirOrderText)}</Text>
					<Text variant="xs" color="muted">taps の入力/設計は各ステップの欄で行います。</Text>
				</Stack>
			</View>
		</Stack>
	);

	const inputBlock = (
		<Stack gap="md">
			<SignalArrayField
				label="信号"
				symbolLatex="x"
				kind={SIGNAL_KIND}
				value={inText}
				onChange={(v) => {
					setInText(v);
					resetFromInput();
				}}
				suggestedSaveName="signal"
			/>

			<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
				<Stack gap="md">
					<Text color="muted">前段 LPF（↓ の前）</Text>
					<Stack direction="row" gap="md" className="items-end flex-wrap">
						<FormField label="方式">
							<Select
								value={preFilterMode}
								onChange={(e) => {
									setPreFilterMode(e.target.value as FilterMode);
									resetFromPreLpf();
								}}
								options={[
									{ value: "none", label: "なし" },
									{ value: "fir", label: "FIR（taps 手入力）" },
									{ value: "fir_design", label: "FIR（窓法で設計）" },
									{ value: "iir_butterworth", label: "IIR（Butterworth）" },
									{ value: "iir_chebyshev1", label: "IIR（Chebyshev I）" },
									{ value: "iir_chebyshev2", label: "IIR（Chebyshev II）" },
								]}
							/>
						</FormField>
						{preFilterMode === "iir_butterworth" || preFilterMode === "iir_chebyshev1" || preFilterMode === "iir_chebyshev2" ? (
							<FormField label="cutoff (Hz)">
								<Input
									value={preCutoffHzText}
									onChange={(e) => {
										setPreCutoffHzText(e.target.value);
										resetFromPreLpf();
									}}
									placeholder="例: 200"
								/>
							</FormField>
						) : null}
					</Stack>

					{preFilterMode === "fir" || preFilterMode === "fir_design" ? (
						<SignalArrayField
							label="FIR taps"
							symbolLatex="h_{pre}"
							kind={SIGNAL_KIND}
							value={preTapsText}
							onChange={(v) => {
								setPreTapsText(v);
								resetFromPreLpf();
							}}
							suggestedSaveName="lpf_pre_taps"
							showGenerator={false}
							extraActions={
								<Button
									variant="outline"
									onClick={() => {
										setPreDesignError(null);
										setPreLpfModalOpen(true);
									}}
									disabled={busy}
								>
									設計
								</Button>
							}
						/>
					) : null}

					{preFilterMode === "iir_butterworth" || preFilterMode === "iir_chebyshev1" || preFilterMode === "iir_chebyshev2" ? (
						<Stack direction="row" gap="md" className="items-end flex-wrap">
							<FormField label="order">
								<Input
									value={preIirOrderText}
									onChange={(e) => {
										setPreIirOrderText(e.target.value);
										resetFromPreLpf();
									}}
									placeholder="例: 6"
								/>
							</FormField>
							{preFilterMode === "iir_chebyshev1" ? (
								<FormField label="ripple (dB)">
									<Input
										value={preRippleDbText}
										onChange={(e) => {
											setPreRippleDbText(e.target.value);
											resetFromPreLpf();
										}}
										placeholder="例: 1"
									/>
								</FormField>
							) : null}
							{preFilterMode === "iir_chebyshev2" ? (
								<FormField label="stop atten (dB)">
									<Input
										value={preStopAttenDbText}
										onChange={(e) => {
											setPreStopAttenDbText(e.target.value);
											resetFromPreLpf();
										}}
										placeholder="例: 40"
									/>
								</FormField>
							) : null}
						</Stack>
					) : null}
				</Stack>
			</View>

			<View className="grid lg:grid-cols-2 gap-4">
				<View>
					<Text color="muted">時間波形（入力）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!inParsed.error && inParsed.values.length > 0 ? <DiscreteSignalPlot values={inParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: n / 縦軸: x[n]</Text>
				</View>
				<View>
					<Text color="muted">スペクトル |X[k]|（片側）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!inMagParsed.error && inMagParsed.values.length > 0 ? <DiscreteSignalPlot values={inMagParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: k（0〜fs/2） / 縦軸: |X[k]|</Text>
				</View>
			</View>

			<View className="grid lg:grid-cols-2 gap-4">
				<View>
					<Text color="muted">時間波形（LPF後）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!filteredParsed.error && filteredParsed.values.length > 0 ? <DiscreteSignalPlot values={filteredParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: n / 縦軸: x_f[n]</Text>
				</View>
				<View>
					<Text color="muted">スペクトル |Xf[k]|（片側）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!filteredMagParsed.error && filteredMagParsed.values.length > 0 ? <DiscreteSignalPlot values={filteredMagParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: k（0〜fs/2） / 縦軸: |Xf[k]|</Text>
				</View>
			</View>
		</Stack>
	);

	const actionBlock = (
		<Stack gap="sm">
			<Stack direction="row" gap="sm" className="justify-end flex-wrap">
				<Button variant="outline" onClick={() => void runPreLpf()} disabled={busy}>
					{busy ? "計算中..." : "2) 前段 LPF"}
				</Button>
				<Button variant="outline" onClick={() => void runDownsample()} disabled={busy}>
					{busy ? "計算中..." : "3) ↓ ダウンサンプリング"}
				</Button>
				<Button variant="outline" onClick={() => void runUpsample()} disabled={busy}>
					{busy ? "計算中..." : "4) ↑ アップサンプリング"}
				</Button>
				<Button onClick={() => void runReconLpf()} disabled={busy}>
					{busy ? "計算中..." : "5) 復元 LPF"}
				</Button>
			</Stack>
			{error ? <Text color="danger">{error}</Text> : null}
		</Stack>
	);

	const outputBlock = (
		<Stack gap="md">
			<Text color="muted">ダウンサンプル後のサンプルレートは $fs′ = fs/M$ です（復元後は $fs$ に戻ります）。</Text>

			<View className="grid lg:grid-cols-2 gap-4">
				<View>
					<Text color="muted">時間波形（↓ダウンサンプリング）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!downParsed.error && downParsed.values.length > 0 ? <DiscreteSignalPlot values={downParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: n / 縦軸: x↓[n]</Text>
				</View>
				<View>
					<Text color="muted">スペクトル |X↓[k]|（片側）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!downMagParsed.error && downMagParsed.values.length > 0 ? <DiscreteSignalPlot values={downMagParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: k（0〜fs′/2） / 縦軸: |X↓[k]|</Text>
				</View>
			</View>

			<View className="grid lg:grid-cols-2 gap-4">
				<View>
					<Text color="muted">時間波形（↑アップサンプリング, 0挿入）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!upParsed.error && upParsed.values.length > 0 ? <DiscreteSignalPlot values={upParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: n / 縦軸: x↑[n]</Text>
				</View>
				<View>
					<Text color="muted">スペクトル |X↑[k]|（片側）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!upMagParsed.error && upMagParsed.values.length > 0 ? <DiscreteSignalPlot values={upMagParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: k（0〜fs/2） / 縦軸: |X↑[k]|</Text>
				</View>
			</View>

			<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
				<Stack gap="md">
					<Text color="muted">復元 LPF（↑ の後）</Text>
					<Stack direction="row" gap="md" className="items-end flex-wrap">
						<FormField label="方式">
							<Select
								value={reconFilterMode}
								onChange={(e) => {
									setReconFilterMode(e.target.value as FilterMode);
									resetFromReconLpf();
								}}
								options={[
									{ value: "none", label: "なし" },
									{ value: "fir", label: "FIR（taps 手入力）" },
									{ value: "fir_design", label: "FIR（窓法で設計）" },
									{ value: "iir_butterworth", label: "IIR（Butterworth）" },
									{ value: "iir_chebyshev1", label: "IIR（Chebyshev I）" },
									{ value: "iir_chebyshev2", label: "IIR（Chebyshev II）" },
								]}
							/>
						</FormField>
						{reconFilterMode === "iir_butterworth" || reconFilterMode === "iir_chebyshev1" || reconFilterMode === "iir_chebyshev2" ? (
							<FormField label="cutoff (Hz)">
								<Input
									value={reconCutoffHzText}
									onChange={(e) => {
										setReconCutoffHzText(e.target.value);
										resetFromReconLpf();
									}}
									placeholder="例: 200"
								/>
							</FormField>
						) : null}
					</Stack>

					{reconFilterMode === "fir" || reconFilterMode === "fir_design" ? (
						<SignalArrayField
							label="FIR taps"
							symbolLatex="h_{recon}"
							kind={SIGNAL_KIND}
							value={reconTapsText}
							onChange={(v) => {
								setReconTapsText(v);
								resetFromReconLpf();
							}}
							suggestedSaveName="lpf_recon_taps"
							showGenerator={false}
							extraActions={
								<Button
									variant="outline"
									onClick={() => {
										setReconDesignError(null);
										setReconLpfModalOpen(true);
									}}
									disabled={busy}
								>
									設計
								</Button>
							}
						/>
					) : null}

					{reconFilterMode === "iir_butterworth" || reconFilterMode === "iir_chebyshev1" || reconFilterMode === "iir_chebyshev2" ? (
						<Stack direction="row" gap="md" className="items-end flex-wrap">
							<FormField label="order">
								<Input
									value={reconIirOrderText}
									onChange={(e) => {
										setReconIirOrderText(e.target.value);
										resetFromReconLpf();
									}}
									placeholder="例: 6"
								/>
							</FormField>
							{reconFilterMode === "iir_chebyshev1" ? (
								<FormField label="ripple (dB)">
									<Input
										value={reconRippleDbText}
										onChange={(e) => {
											setReconRippleDbText(e.target.value);
											resetFromReconLpf();
										}}
										placeholder="例: 1"
									/>
								</FormField>
							) : null}
							{reconFilterMode === "iir_chebyshev2" ? (
								<FormField label="stop atten (dB)">
									<Input
										value={reconStopAttenDbText}
										onChange={(e) => {
											setReconStopAttenDbText(e.target.value);
											resetFromReconLpf();
										}}
										placeholder="例: 40"
									/>
								</FormField>
							) : null}
						</Stack>
					) : null}
				</Stack>
			</View>

			<View className="grid lg:grid-cols-2 gap-4">
				<View>
					<Text color="muted">時間波形（復元）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!reconParsed.error && reconParsed.values.length > 0 ? <DiscreteSignalPlot values={reconParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: n / 縦軸: x̂[n]</Text>
				</View>
				<View>
					<Text color="muted">スペクトル |X̂[k]|（片側）</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!reconMagParsed.error && reconMagParsed.values.length > 0 ? <DiscreteSignalPlot values={reconMagParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: k（0〜fs/2） / 縦軸: |X̂[k]|</Text>
				</View>
			</View>

			<View>
				<Text color="muted">差分（復元 − 元信号）</Text>
				<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
					{!diffParsed.error && diffParsed.values.length > 0 ? <DiscreteSignalPlot values={diffParsed.values} /> : null}
				</View>
				<Text variant="xs" color="muted">横軸: n / 縦軸: x̂[n] − x[n]</Text>
			</View>

			<FormField label={nRecon === null ? "復元信号" : `復元信号（${nRecon}点）`}>
				<Stack gap="sm">
					<Stack direction="row" gap="sm" className="justify-end">
						<SaveVariableIconButton kind={SIGNAL_KIND} value={lab.reconText} suggestedName="reconstructed" />
					</Stack>
					<TextArea value={lab.reconText} readOnly placeholder="ここに結果が表示されます" rows={6} />
				</Stack>
			</FormField>
		</Stack>
	);

	const verificationBlock =
		diffRmse !== null || diffMaxAbs !== null || (nIn !== null && nRecon !== null) ? (
			<Stack direction="row" gap="md" className="flex-wrap">
				{diffRmse !== null ? <Text color="muted">RMSE = {diffRmse.toFixed(6)}</Text> : null}
				{diffMaxAbs !== null ? <Text color="muted">max |Δ| = {diffMaxAbs.toFixed(6)}</Text> : null}
				{nRecon !== null ? <Text color="muted">復元 N = {nRecon}</Text> : null}
				{nIn !== null && nRecon !== null ? (
					<Text color={nIn === nRecon ? "success" : "warning"}>検証: 元信号 N={nIn} / 復元 N={nRecon}</Text>
				) : null}
			</Stack>
		) : undefined;

	return (
		<>
			<UnaryOperationLayout
				setting={settingBlock}
				input={inputBlock}
				action={actionBlock}
				output={outputBlock}
				verification={verificationBlock}
			/>

			<Modal
				open={preLpfModalOpen}
				onClose={() => {
					setPreLpfModalOpen(false);
					setPreDesignError(null);
				}}
				title="前段 LPF taps を設計（FIR）"
				footer={
					<Stack direction="row" gap="sm" className="justify-end w-full">
						<Button
							variant="outline"
							onClick={() => {
								setPreLpfModalOpen(false);
								setPreDesignError(null);
							}}
						>
							閉じる
						</Button>
						<Button
							onClick={() =>
							void (async () => {
								setPreDesignError(null);
								setBusy(true);
								try {
									const res = await designFirLowpassTaps({
										cutoffHzText: preCutoffHzText,
										numTapsText: preNumTapsText,
										windowType: preWindowType,
										kaiserBetaText: preKaiserBetaText,
									});
									if (!res.ok) {
										setPreDesignError(res.message);
										return;
									}
									setPreTapsText(formatNumberList(res.taps));
									resetFromPreLpf();
									setPreLpfModalOpen(false);
								} finally {
									setBusy(false);
								}
							})()
						}
							disabled={busy}
						>
							{busy ? "設計中…" : "設計して適用"}
						</Button>
					</Stack>
				}
				size="lg"
			>
				<Stack gap="md">
					<Text color="muted">窓法で FIR の LPF taps を生成します。</Text>
					<Stack direction="row" gap="md" className="items-end flex-wrap">
						<FormField label="cutoff (Hz)">
							<Input value={preCutoffHzText} onChange={(e) => setPreCutoffHzText(e.target.value)} placeholder="例: 200" />
						</FormField>
						<FormField label="numTaps">
							<Input value={preNumTapsText} onChange={(e) => setPreNumTapsText(e.target.value)} placeholder="例: 101" />
						</FormField>
						<FormField label="window">
							<Select
								value={preWindowType}
								onChange={(e) => setPreWindowType(e.target.value as WindowType)}
								options={[
									{ value: "hann", label: "hann" },
									{ value: "hamming", label: "hamming" },
									{ value: "blackman", label: "blackman" },
									{ value: "rectangular", label: "rectangular" },
									{ value: "kaiser", label: "kaiser" },
								]}
							/>
						</FormField>
						<FormField label="kaiser β">
							<Input value={preKaiserBetaText} onChange={(e) => setPreKaiserBetaText(e.target.value)} placeholder="例: 8.6" />
						</FormField>
					</Stack>
					{preDesignError ? <Text color="danger">{preDesignError}</Text> : null}
				</Stack>
			</Modal>

			<Modal
				open={reconLpfModalOpen}
				onClose={() => {
					setReconLpfModalOpen(false);
					setReconDesignError(null);
				}}
				title="復元 LPF taps を設計（FIR）"
				footer={
					<Stack direction="row" gap="sm" className="justify-end w-full">
						<Button
							variant="outline"
							onClick={() => {
								setReconLpfModalOpen(false);
								setReconDesignError(null);
							}}
						>
							閉じる
						</Button>
						<Button
							onClick={() =>
							void (async () => {
								setReconDesignError(null);
								setBusy(true);
								try {
									const res = await designFirLowpassTaps({
										cutoffHzText: reconCutoffHzText,
										numTapsText: reconNumTapsText,
										windowType: reconWindowType,
										kaiserBetaText: reconKaiserBetaText,
									});
									if (!res.ok) {
										setReconDesignError(res.message);
										return;
									}
									setReconTapsText(formatNumberList(res.taps));
									resetFromReconLpf();
									setReconLpfModalOpen(false);
								} finally {
									setBusy(false);
								}
							})()
						}
							disabled={busy}
						>
							{busy ? "設計中…" : "設計して適用"}
						</Button>
					</Stack>
				}
				size="lg"
			>
				<Stack gap="md">
					<Text color="muted">窓法で FIR の LPF taps を生成します。</Text>
					<Stack direction="row" gap="md" className="items-end flex-wrap">
						<FormField label="cutoff (Hz)">
							<Input value={reconCutoffHzText} onChange={(e) => setReconCutoffHzText(e.target.value)} placeholder="例: 200" />
						</FormField>
						<FormField label="numTaps">
							<Input value={reconNumTapsText} onChange={(e) => setReconNumTapsText(e.target.value)} placeholder="例: 101" />
						</FormField>
						<FormField label="window">
							<Select
								value={reconWindowType}
								onChange={(e) => setReconWindowType(e.target.value as WindowType)}
								options={[
									{ value: "hann", label: "hann" },
									{ value: "hamming", label: "hamming" },
									{ value: "blackman", label: "blackman" },
									{ value: "rectangular", label: "rectangular" },
									{ value: "kaiser", label: "kaiser" },
								]}
							/>
						</FormField>
						<FormField label="kaiser β">
							<Input value={reconKaiserBetaText} onChange={(e) => setReconKaiserBetaText(e.target.value)} placeholder="例: 8.6" />
						</FormField>
					</Stack>
					{reconDesignError ? <Text color="danger">{reconDesignError}</Text> : null}
				</Stack>
			</Modal>
		</>
	);
};
