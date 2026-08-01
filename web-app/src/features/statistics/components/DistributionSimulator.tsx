"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StatisticsApi } from "@my-project/client-sdk";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Select } from "../../../design/baseComponents/Select";
import { Slider } from "../../../design/baseComponents/Slider";
import { Button } from "../../../design/baseComponents/Button";
import { IconButton } from "../../../design/baseComponents/IconButton";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import { Database, Dice5, Save, Trash2 } from "lucide-react";

export const DistributionSimulator: React.FC = () => {
    // States for Distributions
    const [distType, setDistType] = useState<string>("normal");
    const [normMean, setNormMean] = useState<number>(0);
    const [normStd, setNormStd] = useState<number>(1);
    const [tDf, setTDf] = useState<number>(10);
    const [binomN, setBinomN] = useState<number>(20);
    const [binomP, setBinomP] = useState<number>(0.5);
    const [poissonLambda, setPoissonLambda] = useState<number>(5);
    const [chisqDf, setChisqDf] = useState<number>(5);
    const [fDf1, setFDf1] = useState<number>(10);
    const [fDf2, setFDf2] = useState<number>(10);
    const [plotSvg, setPlotSvg] = useState<string>("");

    // States for Sampling
    const [sampleSize, setSampleSize] = useState<number>(100);
    const [samples, setSamples] = useState<number[] | null>(null);
    const [busy, setBusy] = useState(false);

    const [pendingSave, setPendingSave] = useState<{ value: string; kind: string } | null>(null);

    useEffect(() => {
        const updatePlot = async () => {
            try {
                let svg = "";
                switch (distType) {
                    case "normal": svg = await StatisticsApi.getNormalPdfSvg(normMean, normStd); break;
                    case "t": svg = await StatisticsApi.getTPdfSvg(tDf); break;
                    case "chisq": svg = await StatisticsApi.getChisqPdfSvg(chisqDf); break;
                    case "f": svg = await StatisticsApi.getFPdfSvg(fDf1, fDf2); break;
                    case "binomial": svg = await StatisticsApi.getBinomialPmfSvg(binomN, binomP); break;
                    case "poisson": svg = await StatisticsApi.getPoissonPmfSvg(poissonLambda); break;
                }
                setPlotSvg(svg);
            } catch (e) {
                console.error(e);
            }
        };
        updatePlot();
    }, [distType, normMean, normStd, tDf, binomN, binomP, poissonLambda, chisqDf, fDf1, fDf2]);

    const handleGenerateSamples = async () => {
        setBusy(true);
        try {
            let res: number[] = [];
            switch (distType) {
                case "normal": res = await StatisticsApi.sampleNormal(normMean, normStd, sampleSize); break;
                case "t": res = await StatisticsApi.sampleT(tDf, sampleSize); break;
                case "chisq": res = await StatisticsApi.sampleChisq(chisqDf, sampleSize); break;
                case "f": res = await StatisticsApi.sampleF(fDf1, fDf2, sampleSize); break;
                case "binomial": res = await StatisticsApi.sampleBinomial(binomN, binomP, sampleSize); break;
                case "poisson": res = await StatisticsApi.samplePoisson(poissonLambda, sampleSize); break;
            }
            setSamples(res);
        } catch (e) {
            console.error(e);
            alert("Error generating samples: " + e);
        } finally {
            setBusy(false);
        }
    };

    const distOptions = [
        { label: "正規分布 (Normal)", value: "normal" },
        { label: "t 分布 (Student's t)", value: "t" },
        { label: "カイ二乗分布 (Chi-Square)", value: "chisq" },
        { label: "F 分布", value: "f" },
        { label: "二項分布 (Binomial)", value: "binomial" },
        { label: "ポアソン分布 (Poisson)", value: "poisson" },
    ];

    // Simple visualization overlay: vertical lines or dots based on sample values
    const sampleOverlay = useMemo(() => {
        if (!samples || samples.length === 0) return null;

        // Find min/max for scaling (this is very rough without SVG viewBox knowledge)
        // We'll assume the plot is roughly centered or has standard ranges
        // For visualization purposes, let's just show the first 200 samples to avoid SVG bloat
        const displayedSamples = samples.slice(0, 500);

        // This is a placeholder for actual SVG coordinate transformation.
        // We will try to prepend this to the plotSvg in a real scenario or just display separately.
        // For now, let's just show a summary below.
        return (
            <Stack gap="xs" className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <Stack direction="row" className="justify-between items-center">
                    <Stack direction="row" gap="md" className="items-center">
                        <Text weight="bold">生成されたサンプル ({samples.length}件)</Text>
                        <Text variant="xs" color="secondary">
                            平均: {(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(4)}
                        </Text>
                    </Stack>
                    <Stack direction="row" gap="xs">
                        <IconButton size="sm" onClick={() => setPendingSave({ value: samples.join(", "), kind: "statistics.sample" })} title="変数として保存">
                            <Save size={16} />
                        </IconButton>
                        <IconButton size="sm" onClick={() => setSamples(null)} color="danger" title="クリア">
                            <Trash2 size={16} />
                        </IconButton>
                    </Stack>
                </Stack>
                <Text className="font-mono text-xs break-all line-clamp-2 text-slate-500">
                    {samples.slice(0, 50).join(", ")}...
                </Text>
            </Stack>
        );
    }, [samples]);

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">確率分布シミュレーター</Text>
            <Text color="secondary" variant="xs">分布を選択して PDF/PMF を確認し、サンプル生成を実行します。</Text>
            <Select value={distType} onChange={e => {
                setDistType(e.target.value);
                setSamples(null);
            }} options={distOptions} />
        </Stack>
    );

    const inputBlock = (
        <Stack gap="md">
            <View border="base" rounded="lg" padding="md" bg="card">
                <Stack gap="md">
                    <Text weight="semibold" variant="detail" color="secondary">分布パラメータ</Text>
                    {distType === "normal" && (
                        <>
                            <Slider label="平均 (μ)" min={-10} max={10} step={0.1} value={normMean} onChange={setNormMean} />
                            <Slider label="標準偏差 (σ)" min={0.1} max={5} step={0.1} value={normStd} onChange={setNormStd} />
                        </>
                    )}
                    {distType === "t" && (
                        <Slider label="自由度 (df)" min={1} max={100} step={1} value={tDf} onChange={setTDf} />
                    )}
                    {distType === "chisq" && (
                        <Slider label="自由度 (df)" min={1} max={50} step={1} value={chisqDf} onChange={setChisqDf} />
                    )}
                    {distType === "f" && (
                        <>
                            <Slider label="自由度1" min={1} max={100} step={1} value={fDf1} onChange={setFDf1} />
                            <Slider label="自由度2" min={1} max={100} step={1} value={fDf2} onChange={setFDf2} />
                        </>
                    )}
                    {distType === "binomial" && (
                        <>
                            <Slider label="試行回数 (n)" min={1} max={100} step={1} value={binomN} onChange={setBinomN} />
                            <Slider label="成功確率 (p)" min={0} max={1} step={0.01} value={binomP} onChange={setBinomP} />
                        </>
                    )}
                    {distType === "poisson" && (
                        <Slider label="発生率 (λ)" min={0.1} max={50} step={0.5} value={poissonLambda} onChange={setPoissonLambda} />
                    )}
                </Stack>
            </View>

            <View border="base" rounded="lg" padding="md" bg="card" className="border-t-4 border-t-brand-primary">
                <Stack gap="md">
                    <Text weight="semibold" variant="detail" color="secondary">ランダムサンプリング</Text>
                    <Slider label="サンプル数 (N)" min={10} max={1000} step={10} value={sampleSize} onChange={setSampleSize} />
                </Stack>
            </View>
        </Stack>
    );

    const actionBlock = (
        <Button onClick={handleGenerateSamples} loading={busy} color="primary" className="w-full sm:w-auto">
            <Dice5 size={18} className="mr-2" />
            サンプルを生成
        </Button>
    );

    const outputBlock = (
        <Stack gap="md">
            <View border="base" rounded="lg" bg="card" padding="lg" className="flex items-center justify-center min-h-[400px] shadow-inner relative overflow-hidden">
                {plotSvg ? (
                    <View className="w-full" dangerouslySetInnerHTML={{ __html: plotSvg }} />
                ) : (
                    <Stack gap="sm" className="items-center text-slate-400 animate-pulse">
                        <Database size={32} />
                        <Text>描画中...</Text>
                    </Stack>
                )}

                {samples && samples.length > 0 && (
                    <View className="absolute bottom-4 left-0 w-full px-8 pointer-events-none opacity-60">
                        <View className="h-8 border-t border-slate-300 dark:border-slate-700 relative">
                            <Text variant="xs" className="absolute -top-5 left-2 italic text-slate-400">Sample Distribution Preview</Text>
                        </View>
                    </View>
                )}
            </View>

            {sampleOverlay}
        </Stack>
    );

    return (
        <>
            <UnaryOperationLayout
                setting={settingBlock}
                input={inputBlock}
                action={actionBlock}
                output={outputBlock}
            />

            {pendingSave && (
                <SaveVariableModal
                    open={true}
                    onClose={() => setPendingSave(null)}
                    kind={pendingSave.kind}
                    value={pendingSave.value}
                    defaultName={`${distType}_samples`}
                />
            )}
        </>
    );
};
