"use client";

import React, { useState, useMemo, useEffect } from "react";
import { StatisticsApi, TestResult } from "@my-project/client-sdk";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Button } from "../../../design/baseComponents/Button";
import { Slider } from "../../../design/baseComponents/Slider";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import { 
    Activity, 
    Save, 
    Trash2, 
    Zap, 
    MousePointer2, 
    LineChart,
    TrendingUp,
    Info,
    RefreshCw
} from "lucide-react";

export const CorrelationLab: React.FC = () => {
    const [sampleSize, setSampleSize] = useState(50);
    const [correlation, setCorrelation] = useState(0.7);
    const [noise, setNoise] = useState(0.5);
    
    interface DataPoint { x: number; y: number; }
    const [data, setData] = useState<DataPoint[]>([]);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ value: string; kind: string } | null>(null);

    const generateData = async () => {
        setBusy(true);
        try {
            // Pearson's r simulation: y = r*x + sqrt(1-r^2)*noise
            // We'll use our WASM normal sampling for x and for the error term
            const x = await StatisticsApi.sampleNormal(0, 1, sampleSize);
            const error = await StatisticsApi.sampleNormal(0, noise, sampleSize);
            
            const r = correlation;
            const y = x.map((xv, i) => r * xv + Math.sqrt(1 - r * r) * error[i]);

            const points = x.map((xv, i) => ({ x: xv, y: y[i] }));
            setData(points);

            // Run Pearson Correlation Test
            const result = await StatisticsApi.runPearsonCorrelation(x, y);
            setTestResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        generateData();
    }, []);

    const chartConfig = useMemo(() => {
        if (data.length === 0) return null;
        const xs = data.map(p => p.x);
        const ys = data.map(p => p.y);
        const minX = Math.min(...xs, -3);
        const maxX = Math.max(...xs, 3);
        const minY = Math.min(...ys, -3);
        const maxY = Math.max(...ys, 3);

        return { minX, maxX, minY, maxY, rangeX: maxX - minX, rangeY: maxY - minY };
    }, [data]);

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">相関分析ラボ (Correlation Lab)</Text>
            <Text color="secondary" variant="detail">
                2つの変数間の線形関係を視覚化し、ピアソンの相関係数（r）とその統計的有意性を検証します。
            </Text>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="lg">
            <Stack gap="sm">
                <Text weight="bold" className="flex items-center gap-2">
                    <Zap size={18} className="text-primary" />
                    パラメータ設定
                </Text>
                <Text variant="xs" color="secondary">シミュレーションする母集団の相関関係を定義します。</Text>
            </Stack>

            <Stack gap="md" className="p-4 rounded-xl bg-muted/50 border border-base">
                <Slider label="標本サイズ (N)" min={10} max={200} step={1} value={sampleSize} onChange={setSampleSize} />
                <Slider label="想定相関係数 (ρ)" min={-1} max={1} step={0.05} value={correlation} onChange={setCorrelation} />
                <Slider label="観測ノイズ" min={0} max={2} step={0.1} value={noise} onChange={setNoise} />
            </Stack>
        </Stack>
    );

    const actionBlock = (
        <Button color="primary" className="w-full sm:w-auto" onClick={generateData} loading={busy}>
            <RefreshCw size={16} className="mr-2" />
            データを再生成
        </Button>
    );

    const outputBlock = (
        <Stack gap="lg">
            {testResult && (
                <Stack gap="md" className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5">
                    <Text weight="bold" variant="body">分析結果 (Result)</Text>
                    <View className="grid grid-cols-2 gap-4">
                        <Stack gap="xs">
                            <Text variant="xs" color="secondary">相関係数 r</Text>
                            <Text weight="bold" variant="h4" color="primary">{(testResult.effect || 0).toFixed(4)}</Text>
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" color="secondary">P値 (p-value)</Text>
                            <Text weight="bold" variant="h4" color={testResult.p_value < 0.05 ? "success" : "danger"}>
                                {testResult.p_value < 0.0001 ? testResult.p_value.toExponential(2) : testResult.p_value.toFixed(4)}
                            </Text>
                        </Stack>
                    </View>
                    <View border="base" className="border-dashed opacity-20" />
                    <Text variant="xs" color="secondary" className="leading-relaxed">
                        {testResult.p_value < 0.05
                            ? "変数 X と Y の間には統計的に有意な相関が認められます。"
                            : "有意な相関は認められませんでした。観測された関係は偶然によるものである可能性があります。"}
                    </Text>
                </Stack>
            )}

            <View border="base" rounded="lg" bg="card" className="aspect-square relative flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-inner border-2">
                <View className="absolute inset-0 opacity-10 pointer-events-none">
                    <View className="absolute top-1/2 left-0 w-full h-px bg-slate-500" />
                    <View className="absolute left-1/2 top-0 w-px h-full bg-slate-500" />
                </View>

                {chartConfig && data.map((p, i) => {
                    const left = ((p.x - chartConfig.minX) / chartConfig.rangeX) * 100;
                    const bottom = ((p.y - chartConfig.minY) / chartConfig.rangeY) * 100;
                    return (
                        <View
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-primary/40 hover:bg-primary hover:scale-150 transition-all cursor-crosshair"
                            style={{ left: `${left}%`, bottom: `${bottom}%` }}
                        />
                    );
                })}

                {testResult && chartConfig && (
                    <View
                        className="absolute w-[200%] h-px bg-primary/30 border-t border-dashed pointer-events-none"
                        style={{
                            left: '-50%',
                            top: '50%',
                            transform: `rotate(${-Math.atan(testResult.effect || 0) * (180 / Math.PI)}deg)`
                        }}
                    />
                )}

                <Text variant="xs" className="absolute bottom-4 right-4 bg-card/80 px-2 py-1 rounded border">Scatter Plot (N={data.length})</Text>
            </View>

            <Stack direction="row" gap="sm" className="justify-end px-2">
                <Button variant="ghost" size="sm" onClick={() => setData([])} color="secondary">
                    <Trash2 size={16} className="mr-2" />
                    表示をクリア
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPendingSave({ value: data.map(p => `(${p.x},${p.y})`).join(";"), kind: "statistics.correlation_data" })}>
                    <Save size={16} className="mr-2" />
                    データを変数として保存
                </Button>
            </Stack>
        </Stack>
    );

    const verificationBlock =
        testResult ? (
            <Text color={testResult.p_value < 0.05 ? "success" : "warning"}>
                検証: p-value = {testResult.p_value < 0.0001 ? testResult.p_value.toExponential(2) : testResult.p_value.toFixed(4)}
            </Text>
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

            {pendingSave && (
                <SaveVariableModal
                    open={true}
                    onClose={() => setPendingSave(null)}
                    kind={pendingSave.kind}
                    value={pendingSave.value}
                    defaultName="correlation_study_data"
                />
            )}
        </>
    );
};
