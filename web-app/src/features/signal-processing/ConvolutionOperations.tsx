"use client";

import { useMemo, useState } from "react";
import { SignalProcessingApi } from "@my-project/client-sdk";
import { Button } from "../../design/baseComponents/Button";
import { Text } from "../../design/baseComponents/Text";
import { Stack } from "../../design/primitives/Stack";
import { View } from "../../design/primitives/View";
import { UnaryOperationLayout } from "../../shared/layouts/UnaryOperationLayout";
import { SignalArrayField } from "./components/SignalArrayField";
import { DiscreteSignalPlot } from "./components/DiscreteSignalPlot";
import { SignalOutputTabs } from "./components/SignalOutputTabs";
import { formatNumberList, parseNumberList } from "./utils/numberList";

const SIGNAL_KIND = "signalProcessing.signal";

export const ConvolutionOperations = () => {
    const [xText, setXText] = useState("1, 2");
    const [hText, setHText] = useState("1, 1");
    const [yText, setYText] = useState("");
    const [yMag, setYMag] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const xParsed = useMemo(() => parseNumberList(xText), [xText]);
    const hParsed = useMemo(() => parseNumberList(hText), [hText]);
    const yParsed = useMemo(() => parseNumberList(yText), [yText]);

    const yCount = yParsed.error ? null : yParsed.values.length;

    const run = async () => {
        setError(null);

        const x = parseNumberList(xText);
        if (x.error) {
            setError(`x: ${x.error}`);
            return;
        }
        const h = parseNumberList(hText);
        if (h.error) {
            setError(`h: ${h.error}`);
            return;
        }
        if (x.values.length === 0) {
            setError("x が空です。");
            return;
        }
        if (h.values.length === 0) {
            setError("h が空です。");
            return;
        }

        setBusy(true);
        try {
            const y = await SignalProcessingApi.convAutoF64(x.values, h.values);
            setYText(formatNumberList(y));
            const mags = await SignalProcessingApi.dftMagnitudes(y, 1);
            const halfLen = Math.floor(y.length / 2) + 1;
            setYMag(mags.slice(0, halfLen));
        } catch (runError) {
            console.error(runError);
            setError("計算に失敗しました（詳細は console を確認してください）。");
        } finally {
            setBusy(false);
        }
    };

    const inputBlock = (
        <Stack gap="md">
            <SignalArrayField label="信号 x" kind={SIGNAL_KIND} value={xText} onChange={setXText} suggestedSaveName="x" />
            <SignalArrayField label="カーネル h" kind={SIGNAL_KIND} value={hText} onChange={setHText} suggestedSaveName="h" />

            <View className="grid md:grid-cols-2 gap-4">
                <View>
                    <Text color="muted">x プレビュー</Text>
                    <View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
                        {!xParsed.error && xParsed.values.length > 0 ? <DiscreteSignalPlot values={xParsed.values} /> : null}
                    </View>
                </View>
                <View>
                    <Text color="muted">h プレビュー</Text>
                    <View bg="muted" border="base" rounded="lg" padding="md" className="text-muted-foreground">
                        {!hParsed.error && hParsed.values.length > 0 ? <DiscreteSignalPlot values={hParsed.values} /> : null}
                    </View>
                </View>
            </View>
        </Stack>
    );

    const actionBlock = (
        <Stack gap="sm">
            <Button onClick={() => void run()} disabled={busy} className="w-full sm:w-auto">
                {busy ? "計算中..." : "計算"}
            </Button>
            {error ? <Text color="danger">{error}</Text> : null}
        </Stack>
    );

    const outputBlock = (
        <Stack gap="sm">
            <Text color="muted">離散畳み込み $y = x * h$ の結果を表示します。</Text>
            <Stack gap="sm">
                <SignalOutputTabs
                    label={yCount === null ? "結果 y" : `結果 y（${yCount}点）`}
                    kind={SIGNAL_KIND}
                    csvText={yText}
                    signalValues={yParsed.error ? [] : yParsed.values}
                    dftValues={yMag}
                    suggestedSaveName="y"
                />
            </Stack>
        </Stack>
    );

    return (
        <UnaryOperationLayout
            input={inputBlock}
            action={actionBlock}
            output={outputBlock}
        />
    );
};
