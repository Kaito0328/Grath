"use client";

import { useMemo, useState } from "react";
import { Button } from "../../design/baseComponents/Button";
import { Text } from "../../design/baseComponents/Text";
import { FormField } from "../../design/baseComponents/FormField";
import { Input } from "../../design/baseComponents/Input";
import { TextArea } from "../../design/baseComponents/TextArea";
import { SaveVariableIconButton } from "../../shared/variable-manager/SaveVariableIconButton";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { CopyIconButton } from "../../shared/ui/CopyIconButton";

import { SignalProcessingApi } from "@my-project/client-sdk";
import { SignalArrayField } from "./components/SignalArrayField";
import { DiscreteSignalPlot } from "./components/DiscreteSignalPlot";
import { formatNumberList, parseNumberList } from "./utils/numberList";

const SIGNAL_KIND = "signalProcessing.signal";

function reconstructViaDftIdft(signal: number[]): { rmse: number; maxAbs: number } {
	const n = signal.length;
	if (n === 0) return { rmse: 0, maxAbs: 0 };

	const re = new Array<number>(n).fill(0);
	const im = new Array<number>(n).fill(0);

	for (let k = 0; k < n; k++) {
		let sumRe = 0;
		let sumIm = 0;
		for (let t = 0; t < n; t++) {
			const angle = (2 * Math.PI * k * t) / n;
			const x = signal[t] ?? 0;
			sumRe += x * Math.cos(angle);
			sumIm -= x * Math.sin(angle);
		}
		re[k] = sumRe;
		im[k] = sumIm;
	}

	let sq = 0;
	let maxAbs = 0;
	for (let t = 0; t < n; t++) {
		let value = 0;
		for (let k = 0; k < n; k++) {
			const angle = (2 * Math.PI * k * t) / n;
			value += re[k] * Math.cos(angle) - im[k] * Math.sin(angle);
		}
		const restored = value / n;
		const diff = restored - (signal[t] ?? 0);
		sq += diff * diff;
		const abs = Math.abs(diff);
		if (abs > maxAbs) maxAbs = abs;
	}

	return { rmse: Math.sqrt(sq / n), maxAbs };
}

export const SpectrumOperations = () => {
	const [fsText, setFsText] = useState("1000");
	const [xText, setXText] = useState("0, 1, 0, -1, 0, 1, 0, -1");
	const [magText, setMagText] = useState("");
	const [reconstructionError, setReconstructionError] = useState<{ rmse: number; maxAbs: number } | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const xParsed = useMemo(() => parseNumberList(xText), [xText]);
	const magParsed = useMemo(() => parseNumberList(magText), [magText]);

	const n = !xParsed.error ? xParsed.values.length : null;
	const magCount = !magParsed.error ? magParsed.values.length : null;

	async function onRun() {
		setError(null);

		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は正の数にしてください。");
		if (xParsed.error) return setError(`signal: ${xParsed.error}`);
		if (xParsed.values.length === 0) return setError("signal が空です。");

		setBusy(true);
		try {
			const mags = await SignalProcessingApi.dftMagnitudes(xParsed.values, fs);
			const halfLen = Math.floor(xParsed.values.length / 2) + 1;
			setMagText(formatNumberList(mags.slice(0, halfLen)));
			setReconstructionError(reconstructViaDftIdft(xParsed.values));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
			setReconstructionError(null);
		} finally {
			setBusy(false);
		}
	}

	const settingBlock = <Text color="muted">DFT の振幅スペクトル（片側）を表示します。</Text>;

	const inputBlock = (
		<Stack gap="md">
			<Stack direction="row" gap="md" className="items-end flex-wrap">
				<FormField label="fs (Hz)">
					<Input value={fsText} onChange={(e) => setFsText(e.target.value)} placeholder="例: 1000" />
				</FormField>
				{n !== null ? <Text color="muted">N = {n}</Text> : null}
			</Stack>

			<SignalArrayField label="入力 signal" kind={SIGNAL_KIND} value={xText} onChange={setXText} suggestedSaveName="signal" />
		</Stack>
	);

	const actionBlock = (
		<Stack gap="sm">
			<Button onClick={() => void onRun()} disabled={busy} className="w-full sm:w-auto">
				{busy ? "計算中..." : "計算"}
			</Button>
			{error ? <Text color="danger">{error}</Text> : null}
		</Stack>
	);

	const outputBlock = (
		<Stack gap="md">
			<Text color="muted">周波数ビン: $f_k = k\\,fs / N$（k = 0..⌊N/2⌋）</Text>
			<FormField label={magCount === null ? "|X[k]|" : `|X[k]|（${magCount}点）`}>
				<Stack gap="sm">
					<Stack direction="row" gap="sm" className="justify-end">
						<SaveVariableIconButton kind={SIGNAL_KIND} value={magText} suggestedName="mag" />
						<CopyIconButton text={magText} disabled={magText.trim().length === 0} />
					</Stack>
					<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
						{!magParsed.error && magParsed.values.length > 0 ? <DiscreteSignalPlot values={magParsed.values} /> : null}
					</View>
					<TextArea value={magText} readOnly placeholder="ここに結果が表示されます" rows={6} />
				</Stack>
			</FormField>
		</Stack>
	);

	const fsValue = Number(fsText);
	const binStep = n !== null && n > 0 && Number.isFinite(fsValue) && fsValue > 0 ? fsValue / n : null;

	const verificationBlock =
		n !== null && magCount !== null && reconstructionError !== null ? (
			<Stack gap="xs">
				<Text color={reconstructionError.maxAbs < 1e-8 ? "success" : "warning"}>
					逆DFT検証: 元信号との最大誤差 {reconstructionError.maxAbs} / RMSE {reconstructionError.rmse}
				</Text>
				{binStep !== null ? <Text color="muted">周波数分解能 Δf = {binStep}</Text> : null}
			</Stack>
		) : undefined;

	return (
		<UnaryOperationLayout
			setting={settingBlock}
			input={inputBlock}
			action={actionBlock}
			output={outputBlock}
			verification={verificationBlock}
		/>
	);
};
