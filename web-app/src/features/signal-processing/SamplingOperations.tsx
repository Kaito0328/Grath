"use client";

import { useMemo, useState } from "react";
import { Button } from "../../design/baseComponents/Button";
import { Text } from "../../design/baseComponents/Text";
import { FormField } from "../../design/baseComponents/FormField";
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

type SamplingMode = "decimate" | "expand";

export const SamplingOperations = () => {
	const [mode, setMode] = useState<SamplingMode>("decimate");
	const [factorText, setFactorText] = useState("2");
	const [inText, setInText] = useState("0, 1, 0, 1, 0, 1");
	const [outText, setOutText] = useState("");
	const [outMag, setOutMag] = useState<number[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const inParsed = useMemo(() => parseNumberList(inText), [inText]);
	const outParsed = useMemo(() => parseNumberList(outText), [outText]);
	const outCount = outParsed.error ? null : outParsed.values.length;

	async function onRun() {
		setError(null);

		const factor = Number(factorText);
		if (!Number.isFinite(factor) || !Number.isInteger(factor) || factor <= 0) {
			return setError("factor は 1 以上の整数にしてください。");
		}

		const input = parseNumberList(inText);
		if (input.error) return setError(`signal: ${input.error}`);
		if (input.values.length === 0) return setError("signal が空です。");

		setBusy(true);
		try {
			const out =
				mode === "decimate"
					? await SignalProcessingApi.decimate(input.values, factor)
					: await SignalProcessingApi.expand(input.values, factor);
			setOutText(formatNumberList(out));
			const mags = await SignalProcessingApi.dftMagnitudes(out, 1);
			const halfLen = Math.floor(out.length / 2) + 1;
			setOutMag(mags.slice(0, halfLen));
		} catch (e) {
			console.error(e);
			setError("計算に失敗しました（詳細は console を確認してください）。");
		} finally {
			setBusy(false);
		}
	}

	const settingBlock = (
		<Text color="muted">
			decimate は「間引き（フィルタなし）」、expand は「ゼロ挿入（補間フィルタなし）」です。
			エイリアシングや補間の効果を観察しやすい基本操作として用意しています。
		</Text>
	);

	const inputBlock = (
		<Stack gap="md">
			<Stack direction="row" gap="md" className="items-end flex-wrap">
				<FormField label="モード">
					<Select
						value={mode}
						onChange={(e) => setMode(e.target.value as SamplingMode)}
						options={[
							{ value: "decimate", label: "decimate（間引き / フィルタなし）" },
							{ value: "expand", label: "expand（ゼロ挿入 / 補間なし）" },
						]}
					/>
				</FormField>

				<FormField label="factor">
					<Input value={factorText} onChange={(e) => setFactorText(e.target.value)} placeholder="例: 2" />
				</FormField>
			</Stack>

			<SignalArrayField label="入力 signal" kind={SIGNAL_KIND} value={inText} onChange={setInText} suggestedSaveName="signal" />

			<View>
				<Text color="muted">入力プレビュー</Text>
				<View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
					{!inParsed.error && inParsed.values.length > 0 ? <DiscreteSignalPlot values={inParsed.values} /> : null}
				</View>
			</View>
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
		<SignalOutputTabs
			label={outCount === null ? "結果" : `結果（${outCount}点）`}
			kind={SIGNAL_KIND}
			csvText={outText}
			signalValues={outParsed.error ? [] : outParsed.values}
			dftValues={outMag}
			suggestedSaveName="out"
		/>
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
