"use client";

import { useMemo, useState } from "react";
import { Button } from "../../design/baseComponents/Button";
import { Text } from "../../design/baseComponents/Text";
import { Select } from "../../design/baseComponents/Select";
import { Input } from "../../design/baseComponents/Input";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";

import { SignalProcessingApi } from "@my-project/client-sdk";
import { SignalArrayField } from "./components/SignalArrayField";
import { DiscreteSignalPlot } from "./components/DiscreteSignalPlot";
import { SignalOutputTabs } from "./components/SignalOutputTabs";
import { formatNumberList, parseNumberList } from "./utils/numberList";

const SIGNAL_KIND = "signalProcessing.signal";

function halfSpectrum(magnitudes: number[], n: number): number[] {
	const halfLen = Math.floor(n / 2) + 1;
	return magnitudes.slice(0, halfLen);
}

type FirDesignMode = "lowpass" | "highpass" | "bandpass" | "bandstop";

type WindowType = "hann" | "hamming" | "blackman" | "rectangular" | "kaiser";

export const FilterOperations = () => {
	const [xText, setXText] = useState("0, 1, 0, -1, 0, 1, 0, -1");
	const [hText, setHText] = useState("0.25, 0.5, 0.25");
	const [yText, setYText] = useState("");
	const [xMag, setXMag] = useState<number[]>([]);
	const [yMag, setYMag] = useState<number[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [designMode, setDesignMode] = useState<FirDesignMode>("lowpass");
	const [numTapsText, setNumTapsText] = useState("101");
	const [f1Text, setF1Text] = useState("0.1");
	const [f2Text, setF2Text] = useState("0.2");
	const [windowType, setWindowType] = useState<WindowType>("hamming");
	const [kaiserBetaText, setKaiserBetaText] = useState("8.6");

	const xParsed = useMemo(() => parseNumberList(xText), [xText]);
	const hParsed = useMemo(() => parseNumberList(hText), [hText]);
	const yParsed = useMemo(() => parseNumberList(yText), [yText]);

	const xCount = xParsed.error ? null : xParsed.values.length;
	const yCount = yParsed.error ? null : yParsed.values.length;

	async function onRun() {
		setError(null);
		if (xParsed.error) return setError(`signal: ${xParsed.error}`);
		if (hParsed.error) return setError(`taps: ${hParsed.error}`);
		if (xParsed.values.length === 0) return setError("signal が空です。");
		if (hParsed.values.length === 0) return setError("taps が空です。");

		setBusy(true);
		try {
			const sampleRate = 1;
			const magsX = await SignalProcessingApi.dftMagnitudes(xParsed.values, sampleRate);
			setXMag(halfSpectrum(magsX, xParsed.values.length));

			const y = await SignalProcessingApi.convAutoF64(xParsed.values, hParsed.values);
			setYText(formatNumberList(y));

			const magsY = await SignalProcessingApi.dftMagnitudes(y, sampleRate);
			setYMag(halfSpectrum(magsY, y.length));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	async function onDesignTaps() {
		setError(null);

		const numTaps = Number(numTapsText);
		if (!Number.isFinite(numTaps) || !Number.isInteger(numTaps) || numTaps <= 0) {
			return setError("numTaps は 1 以上の整数にしてください。");
		}
		if (numTaps % 2 === 0) {
			return setError("numTaps は奇数にしてください（Type I FIR）。");
		}

		const f1 = Number(f1Text);
		const f2 = Number(f2Text);
		if (!Number.isFinite(f1) || f1 <= 0 || f1 >= 0.5) {
			return setError("周波数は 0 < f < 0.5（正規化）にしてください。");
		}
		if ((designMode === "bandpass" || designMode === "bandstop") && (!Number.isFinite(f2) || f2 <= 0 || f2 >= 0.5)) {
			return setError("周波数は 0 < f < 0.5（正規化）にしてください。");
		}
		if ((designMode === "bandpass" || designMode === "bandstop") && !(f1 < f2)) {
			return setError("帯域指定では f1 < f2 にしてください。");
		}

		const beta = Number(kaiserBetaText);
		if (windowType === "kaiser") {
			if (!Number.isFinite(beta) || beta < 0) {
				return setError("Kaiser β は 0 以上の数値にしてください。");
			}
		}

		setBusy(true);
		try {
			let taps: number[];
			if (designMode === "lowpass") {
				taps = await SignalProcessingApi.designFirLowpassTaps(numTaps, f1, windowType, windowType === "kaiser" ? beta : 0);
			} else if (designMode === "highpass") {
				taps = await SignalProcessingApi.designFirHighpassTaps(numTaps, f1, windowType, windowType === "kaiser" ? beta : 0);
			} else if (designMode === "bandpass") {
				taps = await SignalProcessingApi.designFirBandpassTaps(numTaps, f1, f2, windowType, windowType === "kaiser" ? beta : 0);
			} else {
				taps = await SignalProcessingApi.designFirBandstopTaps(numTaps, f1, f2, windowType, windowType === "kaiser" ? beta : 0);
			}
			setHText(formatNumberList(taps));
		} catch (e) {
			console.error(e);
			setError("taps の生成に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	const settingBlock = (
		<Stack gap="md">
			<Text color="muted">FIR フィルタ（taps）を信号に適用します（内部は畳み込みです）。</Text>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">モード</Text>
				<View className="w-full md:max-w-sm">
					<Select
						value={designMode}
						onChange={(e) => setDesignMode(e.target.value as FirDesignMode)}
						options={[
							{ value: "lowpass", label: "Lowpass" },
							{ value: "highpass", label: "Highpass" },
							{ value: "bandpass", label: "Bandpass" },
							{ value: "bandstop", label: "Bandstop" },
						]}
					/>
				</View>
			</View>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">numTaps（奇数）</Text>
				<View className="w-full md:max-w-sm">
					<Input value={numTapsText} onChange={(e) => setNumTapsText(e.target.value)} placeholder="例: 101" />
				</View>
			</View>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">{designMode === "bandpass" || designMode === "bandstop" ? "f1（正規化）" : "fc（正規化）"}</Text>
				<View className="w-full md:max-w-sm">
					<Input value={f1Text} onChange={(e) => setF1Text(e.target.value)} placeholder="例: 0.1" />
				</View>
			</View>
			{designMode === "bandpass" || designMode === "bandstop" ? (
				<View className="md:flex md:items-center md:justify-between gap-3">
					<Text color="muted">f2（正規化）</Text>
					<View className="w-full md:max-w-sm">
						<Input value={f2Text} onChange={(e) => setF2Text(e.target.value)} placeholder="例: 0.2" />
					</View>
				</View>
			) : null}
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">window</Text>
				<View className="w-full md:max-w-sm">
					<Select
						value={windowType}
						onChange={(e) => setWindowType(e.target.value as WindowType)}
						options={[
							{ value: "hann", label: "Hann" },
							{ value: "hamming", label: "Hamming" },
							{ value: "blackman", label: "Blackman" },
							{ value: "rectangular", label: "Rectangular" },
							{ value: "kaiser", label: "Kaiser" },
						]}
					/>
				</View>
			</View>
			{windowType === "kaiser" ? (
				<View className="md:flex md:items-center md:justify-between gap-3">
					<Text color="muted">Kaiser β（alpha）</Text>
					<View className="w-full md:max-w-sm">
						<Input value={kaiserBetaText} onChange={(e) => setKaiserBetaText(e.target.value)} placeholder="例: 8.6" />
					</View>
				</View>
			) : null}
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">taps 生成</Text>
				<Button onClick={() => void onDesignTaps()} disabled={busy} className="w-full md:w-auto">
					{busy ? "生成中..." : "taps 生成"}
				</Button>
			</View>
		</Stack>
	);

	const inputBlock = (
		<Stack gap="md">
			<SignalArrayField label="信号" symbolLatex="x" kind={SIGNAL_KIND} value={xText} onChange={setXText} suggestedSaveName="signal" />
			<SignalArrayField label="FIR taps" symbolLatex="h" kind={SIGNAL_KIND} value={hText} onChange={setHText} suggestedSaveName="taps" />

			<View className="grid md:grid-cols-2 gap-4">
				<View>
					<Text color="muted">taps</Text>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!hParsed.error && hParsed.values.length > 0 ? <DiscreteSignalPlot values={hParsed.values} /> : null}
					</View>
					<Text variant="xs" color="muted">横軸: n / 縦軸: h[n]</Text>
				</View>
			</View>
		</Stack>
	);

	const actionBlock = (
		<Stack gap="sm">
			<Button onClick={() => void onRun()} disabled={busy} className="w-full sm:w-auto">
				{busy ? "計算中..." : "実行"}
			</Button>
			{error ? <Text color="danger">{error}</Text> : null}
		</Stack>
	);

	const outputBlock = (
		<Stack gap="md">
			<SignalOutputTabs
				label={xCount === null ? "入力 x" : `入力 x（${xCount}点）`}
				kind={SIGNAL_KIND}
				csvText={xText}
				signalValues={xParsed.error ? [] : xParsed.values}
				dftValues={xMag}
				showActions={false}
			/>
			<SignalOutputTabs
				label={yCount === null ? "出力 y" : `出力 y（${yCount}点）`}
				kind={SIGNAL_KIND}
				csvText={yText}
				signalValues={yParsed.error ? [] : yParsed.values}
				dftValues={yMag}
				suggestedSaveName="filtered"
			/>
		</Stack>
	);

	return (
		<UnaryOperationLayout
			setting={settingBlock}
			input={inputBlock}
			action={actionBlock}
			output={outputBlock}
		/>
	);
};
