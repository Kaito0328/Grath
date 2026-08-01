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
import { SignalOutputTabs } from "./components/SignalOutputTabs";
import { formatNumberList, parseNumberList } from "./utils/numberList";

const SIGNAL_KIND = "signalProcessing.signal";

function halfSpectrum(magnitudes: number[], n: number): number[] {
	const halfLen = Math.floor(n / 2) + 1;
	return magnitudes.slice(0, halfLen);
}

type IirFamily = "butterworth" | "chebyshev1" | "chebyshev2";

type IirSpec = "lowpass" | "highpass" | "bandpass" | "bandstop";

export const IirOperations = () => {
	const [xText, setXText] = useState("0, 1, 0, -1, 0, 1, 0, -1");
	const [yText, setYText] = useState("");
	const [xMag, setXMag] = useState<number[]>([]);
	const [yMag, setYMag] = useState<number[]>([]);

	const [family, setFamily] = useState<IirFamily>("butterworth");
	const [spec, setSpec] = useState<IirSpec>("lowpass");
	const [fsText, setFsText] = useState("1000");
	const [orderText, setOrderText] = useState("4");
	const [f1Text, setF1Text] = useState("100");
	const [f2Text, setF2Text] = useState("200");
	const [rippleDbText, setRippleDbText] = useState("1");
	const [stopAttenDbText, setStopAttenDbText] = useState("40");

	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const xParsed = useMemo(() => parseNumberList(xText), [xText]);
	const yParsed = useMemo(() => parseNumberList(yText), [yText]);
	const xCount = xParsed.error ? null : xParsed.values.length;
	const yCount = yParsed.error ? null : yParsed.values.length;

	async function onRun() {
		setError(null);
		if (xParsed.error) return setError(`signal: ${xParsed.error}`);
		if (xParsed.values.length === 0) return setError("signal が空です。");

		const fs = Number(fsText);
		if (!Number.isFinite(fs) || fs <= 0) return setError("fs は 0 より大きい数値にしてください。");

		const order = Number(orderText);
		if (!Number.isFinite(order) || !Number.isInteger(order) || order < 1) {
			return setError("order は 1 以上の整数にしてください。");
		}

		const f1 = Number(f1Text);
		const f2 = Number(f2Text);

		const nyq = fs / 2;
		if (!Number.isFinite(f1) || f1 <= 0 || f1 >= nyq) {
			return setError("周波数は 0 < f < fs/2（Hz）にしてください。");
		}
		if ((spec === "bandpass" || spec === "bandstop") && (!Number.isFinite(f2) || f2 <= 0 || f2 >= nyq)) {
			return setError("周波数は 0 < f < fs/2（Hz）にしてください。");
		}
		if ((spec === "bandpass" || spec === "bandstop") && !(f1 < f2)) {
			return setError("帯域指定では f1 < f2 にしてください。");
		}

		const rippleDb = Number(rippleDbText);
		if (family === "chebyshev1" && (!Number.isFinite(rippleDb) || rippleDb < 0)) {
			return setError("ripple(dB) は 0 以上の数値にしてください。");
		}

		const stopAttenDb = Number(stopAttenDbText);
		if (family === "chebyshev2" && (!Number.isFinite(stopAttenDb) || stopAttenDb <= 0)) {
			return setError("stopband attenuation(dB) は 0 より大きい数値にしてください。");
		}

		setBusy(true);
		try {
			const magsX = await SignalProcessingApi.dftMagnitudes(xParsed.values, fs);
			setXMag(halfSpectrum(magsX, xParsed.values.length));

			let y: number[];
			if (family === "butterworth") {
				y = await SignalProcessingApi.iirButterworthApply(xParsed.values, fs, order, spec, f1, f2);
			} else if (family === "chebyshev1") {
				y = await SignalProcessingApi.iirChebyshev1Apply(xParsed.values, fs, order, rippleDb, spec, f1, f2);
			} else {
				y = await SignalProcessingApi.iirChebyshev2Apply(xParsed.values, fs, order, stopAttenDb, spec, f1, f2);
			}
			setYText(formatNumberList(y));

			const magsY = await SignalProcessingApi.dftMagnitudes(y, fs);
			setYMag(halfSpectrum(magsY, y.length));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	const settingBlock = (
		<Stack gap="md">
			<Text color="muted">
				Butterworth / Chebyshev のデジタル IIR を設計して信号に適用します。周波数は Hz 指定、Nyquist は fs/2 です。
			</Text>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">ファミリー</Text>
				<View className="w-full md:max-w-sm">
					<Select
						value={family}
						onChange={(e) => setFamily(e.target.value as IirFamily)}
						options={[
							{ value: "butterworth", label: "Butterworth" },
							{ value: "chebyshev1", label: "Chebyshev I" },
							{ value: "chebyshev2", label: "Chebyshev II" },
						]}
					/>
				</View>
			</View>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">spec</Text>
				<View className="w-full md:max-w-sm">
					<Select
						value={spec}
						onChange={(e) => setSpec(e.target.value as IirSpec)}
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
				<Text color="muted">fs (Hz)</Text>
				<View className="w-full md:max-w-sm">
					<Input value={fsText} onChange={(e) => setFsText(e.target.value)} placeholder="例: 1000" />
				</View>
			</View>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">order</Text>
				<View className="w-full md:max-w-sm">
					<Input value={orderText} onChange={(e) => setOrderText(e.target.value)} placeholder="例: 4" />
				</View>
			</View>
			<View className="md:flex md:items-center md:justify-between gap-3">
				<Text color="muted">{spec === "bandpass" || spec === "bandstop" ? "f1 (Hz)" : "fc (Hz)"}</Text>
				<View className="w-full md:max-w-sm">
					<Input value={f1Text} onChange={(e) => setF1Text(e.target.value)} placeholder="例: 100" />
				</View>
			</View>

			{spec === "bandpass" || spec === "bandstop" ? (
				<View className="md:flex md:items-center md:justify-between gap-3">
					<Text color="muted">f2 (Hz)</Text>
					<View className="w-full md:max-w-sm">
						<Input value={f2Text} onChange={(e) => setF2Text(e.target.value)} placeholder="例: 200" />
					</View>
				</View>
			) : null}

			{family === "chebyshev1" ? (
				<View className="md:flex md:items-center md:justify-between gap-3">
					<Text color="muted">ripple (dB)</Text>
					<View className="w-full md:max-w-sm">
						<Input value={rippleDbText} onChange={(e) => setRippleDbText(e.target.value)} placeholder="例: 1" />
					</View>
				</View>
			) : null}

			{family === "chebyshev2" ? (
				<View className="md:flex md:items-center md:justify-between gap-3">
					<Text color="muted">stop atten (dB)</Text>
					<View className="w-full md:max-w-sm">
						<Input value={stopAttenDbText} onChange={(e) => setStopAttenDbText(e.target.value)} placeholder="例: 40" />
					</View>
				</View>
			) : null}
		</Stack>
	);

	const inputBlock = (
		<Stack gap="md">
			<SignalArrayField label="信号" symbolLatex="x" kind={SIGNAL_KIND} value={xText} onChange={setXText} suggestedSaveName="signal" />
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
				label={yCount === null ? "出力 y" : `出力（${yCount}点）`}
				kind={SIGNAL_KIND}
				csvText={yText}
				signalValues={yParsed.error ? [] : yParsed.values}
				dftValues={yMag}
				suggestedSaveName="iir_out"
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
