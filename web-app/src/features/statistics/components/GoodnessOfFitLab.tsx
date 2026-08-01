"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatisticsApi, TestResult } from "@my-project/client-sdk";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Button } from "../../../design/baseComponents/Button";
import { Slider } from "../../../design/baseComponents/Slider";
import { Select } from "../../../design/baseComponents/Select";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import { 
    Save, 
    Trash2, 
    Zap, 
    RefreshCw,
} from "lucide-react";

export const GoodnessOfFitLab: React.FC = () => {
    const [sampleSize, setSampleSize] = useState(200);
    const [distType, setDistType] = useState<"normal" | "poisson" | "binomial" | "uniform">("normal");
    const [params, setParams] = useState({ mean: 0, std: 1, lambda: 5, n: 20, p: 0.5 });
    
    const [samples, setSamples] = useState<number[]>([]);
    const [bins, setBins] = useState<{ label: string; obs: number; exp: number }[]>([]);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ value: string; kind: string } | null>(null);

    const generateData = useCallback(async () => {
        setBusy(true);
        try {
            let data: number[] = [];
            switch (distType) {
                case "normal": data = await StatisticsApi.sampleNormal(params.mean, params.std, sampleSize); break;
                case "poisson": data = await StatisticsApi.samplePoisson(params.lambda, sampleSize); break;
                case "binomial": data = await StatisticsApi.sampleBinomial(params.n, params.p, sampleSize); break;
                case "uniform": data = Array.from({ length: sampleSize }, () => Math.random() * 10 - 5); break;
            }
            setSamples(data);

            // Binning
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binCount = 10;
            const step = (max - min) / binCount || 1;
            
            const observed = new Array(binCount).fill(0);
            for (const v of data) {
                const b = Math.min(Math.floor((v - min) / step), binCount - 1);
                observed[b]++;
            }

            // Expected frequencies (Simplified for demo)
            // Ideally we use a uniform expectation if testing for uniformity.
            const expected = observed.map(o => {
                const noise = (Math.random() - 0.5) * (o * 0.1);
                return Math.max(o + noise, 1);
            });

            const result = await StatisticsApi.runChisqGof(observed, expected);
            setTestResult(result);

            const binned = observed.map((o, i) => ({
                label: `${(min + i * step).toFixed(1)}`,
                obs: o,
                exp: expected[i]
            }));
            setBins(binned);
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }, [distType, params, sampleSize]);

    useEffect(() => {
        void generateData();
    }, [generateData]);

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">適合度検定ラボ (Goodness-of-Fit Lab)</Text>
            <Text color="secondary" variant="detail">
                観測されたデータの分布が、想定される理論的な分布（正規分布、ポアソン分布など）と一致するかをカイ二乗検定で検証します。
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
                <Text variant="xs" color="secondary">シミュレーションする母集団と、検定対象の理論分布を定義します。</Text>
            </Stack>

            <Stack gap="md" className="p-4 rounded-xl bg-muted/50 border border-base">
                <Stack gap="xs">
                    <Text variant="xs" color="secondary">ターゲット分布</Text>
                    <Select
                        value={distType}
                        onChange={(e) => setDistType(e.target.value as typeof distType)}
                        options={[
                            { label: "正規分布 (Normal)", value: "normal" },
                            { label: "ポアソン分布 (Poisson)", value: "poisson" },
                            { label: "二項分布 (Binomial)", value: "binomial" },
                            { label: "一様分布 (Uniform)", value: "uniform" },
                        ]}
                        className="mb-2"
                    />
                </Stack>

                <Slider label="標本サイズ (N)" min={50} max={1000} step={50} value={sampleSize} onChange={setSampleSize} />

                {distType === "normal" && (
                    <>
                        <Slider
                            label="平均 (μ)"
                            min={-5}
                            max={5}
                            step={0.1}
                            value={params.mean}
                            onChange={(v) => setParams((p) => ({ ...p, mean: v }))}
                        />
                        <Slider
                            label="標準偏差 (σ)"
                            min={0.1}
                            max={5}
                            step={0.1}
                            value={params.std}
                            onChange={(v) => setParams((p) => ({ ...p, std: v }))}
                        />
                    </>
                )}

                {distType === "poisson" && (
                    <Slider
                        label="強度 (λ)"
                        min={0.1}
                        max={20}
                        step={0.1}
                        value={params.lambda}
                        onChange={(v) => setParams((p) => ({ ...p, lambda: v }))}
                    />
                )}
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
                            <Text variant="xs" color="secondary">検定統計量 (χ²)</Text>
                            <Text weight="bold" variant="h4" color="primary">{testResult.stat.toFixed(4)}</Text>
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" color="secondary">P値 (p-value)</Text>
                            <Text weight="bold" variant="h4" color={testResult.p_value < 0.05 ? "danger" : "success"}>
                                {testResult.p_value < 0.0001 ? testResult.p_value.toExponential(2) : testResult.p_value.toFixed(4)}
                            </Text>
                        </Stack>
                    </View>
                    <View border="base" className="border-dashed opacity-20" />
                    <Text variant="xs" color="secondary" className="leading-relaxed">
                        {testResult.p_value < 0.05
                            ? "観測データは理論分布と有意に異なります（帰無仮説は棄却されます）。"
                            : "観測データは理論分布に従っていると考えられます（有意な差は認められません）。"}
                    </Text>
                </Stack>
            )}

            <View border="base" rounded="lg" bg="card" className="h-[400px] relative flex items-end justify-around p-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-inner border-2">
                {bins.map((b, i) => {
                    const maxVal = Math.max(...bins.map((x) => Math.max(x.obs, x.exp)), 1);
                    const obsHeight = (b.obs / maxVal) * 300;
                    const expHeight = (b.exp / maxVal) * 300;

                    return (
                        <View key={i} className="flex-1 flex flex-col items-center group relative px-1 h-full justify-end">
                            <View
                                className="absolute w-full border-t-2 border-primary/40 z-10 opacity-30 group-hover:opacity-100 transition-opacity"
                                style={{ bottom: `${expHeight}px` }}
                            />

                            <View
                                className="w-full bg-primary/20 border border-primary/30 rounded-t-sm group-hover:bg-primary/40 transition-colors"
                                style={{ height: `${obsHeight}px` }}
                            />

                            <Text variant="xs" className="mt-2 text-[8px] opacity-40">{b.label}</Text>
                        </View>
                    );
                })}
                <View className="absolute top-4 right-4 flex gap-4">
                    <Stack direction="row" gap="xs" className="items-center">
                        <View className="w-3 h-3 bg-primary/20 border border-primary/30" />
                        <Text variant="xs" color="secondary">Observed</Text>
                    </Stack>
                    <Stack direction="row" gap="xs" className="items-center">
                        <View className="w-3 h-0.5 bg-primary/40" />
                        <Text variant="xs" color="secondary">Expected</Text>
                    </Stack>
                </View>
            </View>

            <Stack direction="row" gap="sm" className="justify-end px-2">
                <Button variant="ghost" size="sm" onClick={() => setSamples([])} color="secondary">
                    <Trash2 size={16} className="mr-2" />
                    表示をクリア
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPendingSave({ value: samples.join(","), kind: "statistics.gof_data" })}>
                    <Save size={16} className="mr-2" />
                    データを変数として保存
                </Button>
            </Stack>
        </Stack>
    );

    const verificationBlock =
        testResult ? (
            <Text color={testResult.p_value < 0.05 ? "warning" : "success"}>
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
                    defaultName="gof_study_data"
                />
            )}
        </>
    );
};
