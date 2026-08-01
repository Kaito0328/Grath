"use client";

import React, { useState, useMemo, useEffect } from "react";
import { StatisticsApi, TestResult } from "@my-project/client-sdk";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Select } from "../../../design/baseComponents/Select";
import { Slider } from "../../../design/baseComponents/Slider";
import { Button } from "../../../design/baseComponents/Button";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import { 
    Zap, 
    Trash2, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    ArrowRightLeft,
    Layers,
    FlaskConical,
    Play,
    Info,
    History,
    Dice5
} from "lucide-react";

type LabMode = "single" | "comparison";
type DistType = "normal" | "t" | "binomial" | "poisson";

interface PopulationConfig {
    mean: number; 
    std: number;
    df: number;
    n_trials: number;
    p: number;
    sampleSize: number;
}

interface SampleData {
    clean: number[] | null;
    noisy: number[] | null;
    noiseStd: number;
    outlierCount: number;
}

const formatPValue = (p: number) => {
    if (p === 0) return "0.0000";
    if (p < 0.0001) return p.toExponential(4);
    return p.toFixed(6);
};

export const StatisticsWorkshop: React.FC = () => {
    // --- 1. Global Setup ---
    const [mode, setMode] = useState<LabMode>("comparison");
    const [distType, setDistType] = useState<DistType>("normal");

    // --- 2. Population Configs ---
    const [configs, setConfigs] = useState<PopulationConfig[]>([
        { mean: 0, std: 1, df: 10, n_trials: 20, p: 0.5, sampleSize: 100 },
        { mean: 0.5, std: 1, df: 10, n_trials: 20, p: 0.6, sampleSize: 100 }
    ]);

    // --- 3. Collected Data ---
    const [dataList, setDataList] = useState<SampleData[]>([
        { clean: null, noisy: null, noiseStd: 0.2, outlierCount: 0 },
        { clean: null, noisy: null, noiseStd: 0.2, outlierCount: 0 }
    ]);

    // --- 4. Lab Results ---
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [selectedTest, setSelectedTest] = useState<string>("t-test");
    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ value: string; kind: string } | null>(null);

    // Dynamic test options
    const testOptions = useMemo(() => {
        if (mode === "single") {
            if (distType === "binomial") return [{ label: "1標本 比率 Z検定", value: "z-test" }];
            return [{ label: "1標本 t 検定 (平均の比較)", value: "t-test" }];
        } else {
            if (configs.length > 2) {
                return [
                    { label: "一元配置分散分析 (ANOVA)", value: "anova" },
                    { label: "Kruskal-Wallis 検定 (ノンパラメトリック)", value: "kruskal-wallis" },
                ];
            }
            if (distType === "binomial") return [{ label: "2標本 比率 Z検定 (A/B比較)", value: "z-test" }];
            return [
                { label: "2標本 t 検定 (平均の比較)", value: "t-test" },
                { label: "F検定 (分散の等質性比較)", value: "f-test" },
                { label: "Mann-Whitney U 検定 (ノンパラメトリック)", value: "mann-whitney" },
            ];
        }
    }, [mode, distType, configs.length]);

    // Reset test selection if invalid for new state
    useEffect(() => {
        if (!testOptions.find(o => o.value === selectedTest)) {
            setSelectedTest(testOptions[0]?.value || "t-test");
        }
    }, [testOptions, selectedTest]);

    // Add/Remove groups
    const addGroup = () => {
        if (configs.length >= 5) return;
        setConfigs([...configs, { ...configs[configs.length - 1], mean: configs[configs.length - 1].mean + 0.5 }]);
        setDataList([...dataList, { clean: null, noisy: null, noiseStd: 0.2, outlierCount: 0 }]);
    };

    const removeGroup = (index: number) => {
        if (configs.length <= 2) return;
        setConfigs(configs.filter((_, i) => i !== index));
        setDataList(dataList.filter((_, i) => i !== index));
    };

    // Initial resets when mode or dist changes
    useEffect(() => {
        if (mode === "single") {
            setConfigs([configs[0]]);
            setDataList([dataList[0]]);
        } else if (configs.length < 2) {
            setConfigs([
                configs[0],
                { ...configs[0], mean: configs[0].mean + 0.5 }
            ]);
            setDataList([
                dataList[0],
                { clean: null, noisy: null, noiseStd: 0.2, outlierCount: 0 }
            ]);
        }
        setTestResult(null);
    }, [mode]);

    useEffect(() => {
        setDataList(prev => prev.map(d => ({ ...d, clean: null, noisy: null })));
        setTestResult(null);
    }, [distType]);

    // Data Samplers
    const sample = async (config: PopulationConfig): Promise<number[]> => {
        switch (distType) {
            case "normal": return await StatisticsApi.sampleNormal(config.mean, config.std, config.sampleSize);
            case "t": return await StatisticsApi.sampleT(config.df, config.sampleSize);
            case "binomial": return await StatisticsApi.sampleBinomial(config.n_trials, config.p, config.sampleSize);
            case "poisson": return await StatisticsApi.samplePoisson(config.mean, config.sampleSize);
            default: return [];
        }
    };

    const handleRunLab = async () => {
        setBusy(true);
        try {
            const newSamples: (number[] | null)[] = [];
            const newNoisy: (number[] | null)[] = [];

            for (let i = 0; i < configs.length; i++) {
                const config = configs[i];
                const data = dataList[i];
                const raw = await sample(config);
                newSamples.push(raw);

                let noisy = [...raw];
                if (data.noiseStd > 0) noisy = await StatisticsApi.addGaussianNoise(noisy, data.noiseStd);
                if (data.outlierCount > 0) {
                    noisy = await StatisticsApi.addOutliers(noisy, data.outlierCount, config.mean - 10, config.mean + 10);
                }
                newNoisy.push(noisy);
            }

            setDataList(prev => prev.map((d, i) => ({ ...d, clean: newSamples[i], noisy: newNoisy[i] })));

            // Analysis
            let result: TestResult | null = null;
            if (mode === "single") {
                const noisy0 = newNoisy[0]!;
                const config0 = configs[0];
                if (selectedTest === "z-test") {
                    const totalSuccess = noisy0.reduce((a, b) => a + b, 0);
                    const totalTrials = config0.sampleSize * config0.n_trials;
                    result = await StatisticsApi.runZTestProportion(totalSuccess, totalTrials, config0.p);
                } else {
                    result = await StatisticsApi.runOneSampleTTest(noisy0, config0.mean);
                }
            } else {
                if (configs.length > 2) {
                    if (selectedTest === "anova") {
                        result = await StatisticsApi.runOneWayAnova(newNoisy as number[][]);
                    } else if (selectedTest === "kruskal-wallis") {
                        result = await StatisticsApi.runKruskalWallis(newNoisy as number[][]);
                    }
                } else {
                    const noisy0 = newNoisy[0]!;
                    const noisy1 = newNoisy[1]!;
                    if (selectedTest === "t-test") {
                        result = await StatisticsApi.runTwoSampleTTest(noisy0, noisy1, false);
                    } else if (selectedTest === "f-test") {
                        result = await StatisticsApi.runFTest(noisy0, noisy1);
                    } else if (selectedTest === "z-test") {
                        const s0 = noisy0.reduce((a, b) => a + b, 0);
                        const t0 = configs[0].sampleSize * configs[0].n_trials;
                        const s1 = noisy1.reduce((a, b) => a + b, 0);
                        const t1 = configs[1].sampleSize * configs[1].n_trials;
                        result = await StatisticsApi.runZTestTwoProportions(s0, t0, s1, t1);
                    } else if (selectedTest === "mann-whitney") {
                        result = await StatisticsApi.runMannWhitneyU(noisy0, noisy1, "two-sided", true);
                    }
                }
            }
            setTestResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    };

    const resetLab = () => {
        setDataList(prev => prev.map(d => ({ ...d, clean: null, noisy: null })));
        setTestResult(null);
    };

    // Visualization: Overlapping strip plot
    const visualization = useMemo(() => {
        if (!dataList[0].clean) return null;
        
        const series = dataList.map((d, i) => ({
            values: d.noisy || d.clean || [],
            label: `Group ${String.fromCharCode(65 + i)}`,
            color: i === 0 ? "bg-blue-500" : i === 1 ? "bg-rose-500" : i === 2 ? "bg-emerald-500" : i === 3 ? "bg-amber-500" : "bg-purple-500",
            textColor: i === 0 ? "text-blue-500" : i === 1 ? "text-rose-500" : i === 2 ? "text-emerald-500" : i === 3 ? "text-amber-500" : "text-purple-500",
            bgLight: i === 0 ? "bg-blue-500/5" : i === 1 ? "bg-rose-500/5" : i === 2 ? "bg-emerald-500/5" : i === 3 ? "bg-amber-500/5" : "bg-purple-500/5",
            borderLight: i === 0 ? "border-blue-500/10" : i === 1 ? "border-rose-500/10" : i === 2 ? "border-emerald-500/10" : i === 3 ? "border-amber-500/10" : "border-purple-500/10",
        }));

        const allValues = series.flatMap(s => s.values);
        const minVal = Math.floor(Math.min(...allValues, -2));
        const maxVal = Math.ceil(Math.max(...allValues, 2));
        const range = (maxVal - minVal) || 1;

        const getPos = (v: number) => ((v - minVal) / range) * 100;

        return (
            <View border="base" rounded="lg" bg="card" padding="xl" className="shadow-sm border-2">
                <Stack gap="lg">
                    <Stack direction="row" className="justify-between items-center">
                        <Stack gap="xs">
                            <Text weight="bold">標本の分布（ストリッププロット）</Text>
                            <Text variant="xs" color="secondary">各点は個別の観測値を、縦位置はグループ、横位置は値の大きさを表します。</Text>
                        </Stack>
                        <Stack direction="row" gap="md" className="flex-wrap justify-end">
                            {series.map((s, i) => (
                                <Stack key={i} direction="row" gap="xs" className="items-center">
                                    <View className={`w-3 h-3 rounded-full ${s.color}`} />
                                    <Text variant="xs" color="secondary">{s.label} (N={s.values.length})</Text>
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>

                    <View className="h-56 relative border-b border-slate-200 dark:border-slate-800 mt-4 overflow-hidden">
                        {/* Reference lines */}
                        {[0.25, 0.5, 0.75].map(p => (
                            <View key={p} className="absolute h-full w-px bg-slate-100 dark:bg-slate-900" style={{ left: `${p*100}%` }} />
                        ))}
                        
                        {/* Scale marks */}
                        <View className="absolute bottom-0 left-0 w-full flex justify-between px-1">
                            {[minVal, (minVal + maxVal) / 2, maxVal].map((v, i) => (
                                <View key={i} className="flex flex-col items-center">
                                    <View className="w-px h-2 bg-slate-300 dark:bg-slate-700" />
                                    <View className="h-6 w-20 flex justify-center items-center">
                                        <Text variant="xs" color="secondary">{v.toFixed(1)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* dots */}
                        {series.map((s, groupIndex) => (
                            <React.Fragment key={groupIndex}>
                                {s.values.slice(0, 150).map((x, i) => (
                                    <View 
                                        key={`dot-${groupIndex}-${i}`} 
                                        className={`absolute w-1.5 h-1.5 rounded-full ${s.color} opacity-30 hover:opacity-100 transition-all hover:scale-150`}
                                        style={{ left: `${getPos(x)}%`, top: `${15 + groupIndex * 35 + (i % 5) * 4}px` }}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </View>

                    <View className={`grid ${series.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-4 pt-4`}>
                        {series.map((s, i) => (
                            <Stack key={i} gap="xs" className={`p-3 rounded-lg ${s.bgLight} border ${s.borderLight}`}>
                                <Text variant="xs" color="secondary">{s.label} 標本平均</Text>
                                <Text weight="bold" variant="h4" className={s.textColor}>
                                    {(s.values.reduce((a, b) => a + b, 0) / s.values.length).toFixed(4)}
                                </Text>
                                <Text variant="xs" color="secondary">不偏分散: {
                                    s.values.length > 1 
                                    ? (s.values.reduce((a, b) => a + Math.pow(b - (s.values.reduce((p, q) => p + q, 0) / s.values.length), 2), 0) / (s.values.length - 1)).toFixed(4)
                                    : "0.0000"
                                }</Text>
                            </Stack>
                        ))}
                    </View>
                </Stack>
            </View>
        );
    }, [dataList, mode]);

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">統計的検証ワークスペース</Text>
            <Text color="secondary" variant="detail">
                母集団の定義、標本の抽出、観測誤差の混入、そして仮説検定。垂直フローで学ぶ本格的な統計的検証。
            </Text>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="xl">
            <View border="base" rounded="lg" padding="xl" bg="card" className="relative overflow-hidden border-2">
                <View className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Layers size={140} />
                </View>
                <Stack gap="lg">
                    <Stack direction="row" gap="md" className="items-center">
                        <View bg="primary" rounded="full" className="w-10 h-10 flex items-center justify-center text-white font-bold">1</View>
                        <Stack gap="none">
                            <Text weight="bold" variant="h4">検証計画の基本設定</Text>
                            <Text variant="xs" color="secondary">検証の目的および数学的モデル（尤度関数）を選択します。</Text>
                        </Stack>
                    </Stack>

                    <View className="grid md:grid-cols-2 gap-12">
                        <Stack gap="sm">
                            <Text variant="body" weight="bold">検証モデル (Verification Model)</Text>
                            <View className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                                <Button
                                    size="sm"
                                    variant={mode === "single" ? "solid" : "ghost"}
                                    color="primary"
                                    onClick={() => setMode("single")}
                                    className="rounded-md shadow-sm"
                                >
                                    単一母集団 検定
                                </Button>
                                <Button
                                    size="sm"
                                    variant={mode === "comparison" ? "solid" : "ghost"}
                                    color="primary"
                                    onClick={() => setMode("comparison")}
                                    className="rounded-md shadow-sm"
                                >
                                    2群の比較 (A/B比較)
                                </Button>
                            </View>
                            <Text variant="xs" color="secondary" className="px-1 text-justify">
                                {mode === "single"
                                    ? "既知の理論値や目標値に対し、取得した標本が一致するかを検証します。"
                                    : "2つのグループから取得した標本に基づき、母集団間に有意な差があるかを検証します。"}
                            </Text>
                        </Stack>

                        <Stack gap="sm">
                            <Text variant="body" weight="bold">確率分布の定義 (Likelihood)</Text>
                            <Select
                                value={distType}
                                onChange={(e) => setDistType(e.target.value as DistType)}
                                options={[
                                    { label: "正規分布 (Normal) - 測定誤差や身長など", value: "normal" },
                                    { label: "t分布 (Student's t) - 小規模サンプルの解析", value: "t" },
                                    { label: "二項分布 (Binomial) - コンバージョン率など", value: "binomial" },
                                    { label: "ポアソン分布 (Poisson) - 事故数や故障数など", value: "poisson" },
                                ]}
                                className="w-full"
                            />
                        </Stack>
                    </View>
                </Stack>
            </View>

            <View border="base" rounded="lg" padding="xl" bg="card" className="relative border-2">
                <Stack gap="lg">
                    <Stack direction="row" gap="md" className="items-center">
                        <View bg="primary" rounded="full" className="w-10 h-10 flex items-center justify-center text-white font-bold">2</View>
                        <Stack gap="none">
                            <Text weight="bold" variant="h4">母集団パラメータおよび観測誤差の設定</Text>
                            <Text variant="xs" color="secondary">「真理のパラメータ」と、観測時に混入する「誤差」を定義します。</Text>
                        </Stack>
                    </Stack>

                    <View className="grid lg:grid-cols-2 gap-8">
                        {configs.map((config, i) => (
                            <Stack key={i} gap="md" className={`p-6 rounded-xl border-l-4 ${i === 0 ? "border-blue-500 bg-blue-500/5" : i === 1 ? "border-rose-500 bg-rose-500/5" : i === 2 ? "border-emerald-500 bg-emerald-500/5" : i === 3 ? "border-amber-500 bg-amber-500/5" : "border-purple-500 bg-purple-500/5"} shadow-inner relative`}>
                                <Stack direction="row" className="justify-between items-center">
                                    <Text weight="bold" className={i === 0 ? "text-blue-500" : i === 1 ? "text-rose-500" : i === 2 ? "text-emerald-500" : i === 3 ? "text-amber-500" : "text-purple-500"}>
                                        Group {String.fromCharCode(65 + i)} {mode === "comparison" && i === 0 ? "(対照群)" : mode === "comparison" && i === 1 ? "(実験群)" : ""}
                                    </Text>
                                    <Stack direction="row" gap="xs">
                                        {configs.length > 2 && (
                                            <Button variant="ghost" size="sm" onClick={() => removeGroup(i)} color="danger" className="h-6 w-6 p-0">
                                                <Trash2 size={12} />
                                            </Button>
                                        )}
                                        <View className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${i === 0 ? "text-blue-600 bg-blue-500/10" : i === 1 ? "text-rose-600 bg-rose-500/10" : "text-slate-600 bg-slate-500/10"}`}>
                                            {i === 0 ? "Control" : i === 1 ? "Exp" : `Group ${i + 1}`}
                                        </View>
                                    </Stack>
                                </Stack>
                                <Stack gap="lg" className="mt-2">
                                    {distType === "normal" && (
                                        <>
                                            <Slider label={`平均 (μ_${String.fromCharCode(65 + i)})`} min={-3} max={3} step={0.1} value={config.mean} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, mean: v } : c))} />
                                            <Slider label={`標準偏差 (σ_${String.fromCharCode(65 + i)})`} min={0.1} max={3} step={0.1} value={config.std} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, std: v } : c))} />
                                        </>
                                    )}
                                    {distType === "t" && (
                                        <Slider label={`自由度 (df_${String.fromCharCode(65 + i)})`} min={1} max={50} step={1} value={config.df} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, df: v } : c))} />
                                    )}
                                    {distType === "binomial" && (
                                        <>
                                            <Slider label="試行回数 (n_trials)" min={1} max={100} step={1} value={config.n_trials} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, n_trials: v } : c))} />
                                            <Slider label={`成功確率 (p_${String.fromCharCode(65 + i)})`} min={0} max={1} step={0.01} value={config.p} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, p: v } : c))} />
                                        </>
                                    )}
                                    {distType === "poisson" && (
                                        <Slider label={`強度/平均 (λ_${String.fromCharCode(65 + i)})`} min={0.1} max={20} step={0.1} value={config.mean} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, mean: v } : c))} />
                                    )}
                                    <View border="base" className="my-2 opacity-50 border-dashed" />
                                    <Slider label={`標本サイズ (N_${String.fromCharCode(65 + i)})`} min={10} max={500} step={10} value={config.sampleSize} onChange={(v) => setConfigs((prev) => prev.map((c, idx) => idx === i ? { ...c, sampleSize: v } : c))} />
                                    <Slider label="観測ノイズ (σ_noise)" min={0} max={2} step={0.1} value={dataList[i].noiseStd} onChange={(v) => setDataList((prev) => prev.map((d, idx) => idx === i ? { ...d, noiseStd: v } : d))} />
                                    <Slider label="外れ値混入数" min={0} max={10} step={1} value={dataList[i].outlierCount} onChange={(v) => setDataList((prev) => prev.map((d, idx) => idx === i ? { ...d, outlierCount: v } : d))} />
                                </Stack>
                            </Stack>
                        ))}

                        {mode === "comparison" && configs.length < 5 && (
                            <Button
                                variant="outline"
                                className="h-full border-dashed border-2 flex flex-col gap-2 min-h-[300px] opacity-60 hover:opacity-100"
                                onClick={addGroup}
                            >
                                <Zap size={32} />
                                <Text weight="bold">グループを追加</Text>
                                <Text variant="xs">ANOVA解析などのために最大5群まで追加可能です。</Text>
                            </Button>
                        )}
                    </View>
                </Stack>
            </View>
        </Stack>
    );

    const actionBlock = (
        <Button color="primary" size="lg" className="w-full h-16 shadow-lg hover:shadow-xl transition-all" onClick={handleRunLab} loading={busy}>
            <FlaskConical size={24} className="mr-3" />
            検証シミュレーションの実行
        </Button>
    );

    const outputBlock = dataList[0].clean ? (
        <View border="base" rounded="lg" padding="xl" bg="card" className="border-2 animate-in slide-in-from-bottom-6 duration-700">
            <Stack gap="xl">
                <Stack direction="row" gap="md" className="items-center">
                    <View bg="primary" rounded="full" className="w-10 h-10 flex items-center justify-center text-white font-bold">3</View>
                    <Stack gap="none">
                        <Text weight="bold" variant="h4">分析結果：統計的推論による検証</Text>
                        <Text variant="xs" color="secondary">収集された標本データから、母集団の真理を統計的に推定します。</Text>
                    </Stack>
                </Stack>

                <View className="grid lg:grid-cols-12 gap-10 items-start">
                    <View className="lg:col-span-7">
                        {visualization}
                    </View>

                    <Stack gap="lg" className="lg:col-span-5">
                        <View border="base" rounded="lg" padding="xl" bg="muted" className="border-2 border-brand-primary/20 shadow-inner">
                            <Stack gap="lg">
                                <Stack gap="sm">
                                    <Text variant="detail" weight="bold">統計的検定手法</Text>
                                    <Select
                                        value={selectedTest}
                                        onChange={(e) => setSelectedTest(e.target.value)}
                                        options={testOptions}
                                        className="w-full"
                                    />
                                    <View className="flex flex-row items-center gap-1.5 p-2 bg-blue-500/5 rounded border border-blue-500/10">
                                        <Info size={14} className="text-blue-500" />
                                        <Text variant="xs" color="secondary">
                                            {selectedTest === "t-test" ? "平均値の有意な差異を検出します。" : selectedTest === "f-test" ? "分散（ばらつき）の等質性を検証します。" : selectedTest === "mann-whitney" ? "正規分布を仮定しないノンパラメトリックな手法で、2群の代表値の差を検証します。" : selectedTest === "anova" ? "3群以上の母平均の間に有意な差があるかを検証します。" : selectedTest === "kruskal-wallis" ? "正規分布を仮定せず、3群以上の代表値の差を検証します。" : "比率（生起確率）の差異を検証します。"}
                                        </Text>
                                    </View>
                                </Stack>

                                {testResult && (
                                    <Stack gap="lg">
                                        <View className="grid grid-cols-2 gap-4">
                                            <Stack gap="xs" className="p-4 bg-card rounded-xl border-2">
                                                <Text variant="xs" color="secondary" className="uppercase tracking-widest text-[9px] font-bold">P-VALUE</Text>
                                                <Text weight="bold" variant="h3" color={testResult.p_value < 0.05 ? "success" : "danger"}>
                                                    {formatPValue(testResult.p_value)}
                                                </Text>
                                            </Stack>
                                            <Stack gap="xs" className="p-4 bg-card rounded-xl border-2">
                                                <Text variant="xs" color="secondary" className="uppercase tracking-widest text-[9px] font-bold">STATISTIC</Text>
                                                <Text weight="bold" variant="h3">{testResult.stat.toFixed(4)}</Text>
                                            </Stack>
                                        </View>

                                        <View padding="xl" rounded="lg" className={testResult.p_value < 0.05 ? "bg-green-500/5 border-2 border-green-500/30 shadow-sm" : "bg-red-500/5 border-2 border-red-500/30 shadow-sm"}>
                                            <Stack gap="sm">
                                                <Stack direction="row" gap="sm" className="items-center">
                                                    {testResult.p_value < 0.05 ? <CheckCircle2 className="text-green-500" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
                                                    <Text weight="bold" variant="h4">
                                                        {testResult.p_value < 0.05 ? "有意な差が認められます" : "有意な差は認められません"}
                                                    </Text>
                                                </Stack>
                                                <Text variant="body" color="secondary" className="leading-relaxed">
                                                    {testResult.p_value < 0.05
                                                        ? "帰無仮説は棄却されました。設定した母集団間の差異、あるいは観測された効果は統計的に「偶然ではない」と判断されます。"
                                                        : "差異は観測されていますが、ノイズが大きすぎるか標本数が不足しており、統計的確信を得るには至りませんでした（帰無仮説は棄却されません）。"}
                                                </Text>
                                            </Stack>
                                        </View>
                                    </Stack>
                                )}
                            </Stack>
                        </View>

                        <Stack direction="row" gap="sm" className="justify-end px-2 flex-wrap">
                            <Button variant="ghost" size="sm" onClick={resetLab} color="secondary" className="hover:bg-red-500/5 hover:text-red-500">
                                <Trash2 size={16} className="mr-2" />
                                観測データの破棄
                            </Button>
                            {dataList.map((d, i) => (
                                <Button key={i} variant="outline" size="sm" onClick={() => setPendingSave({ value: d.noisy?.join(", ") || "", kind: "statistics.workshop_data" })}>
                                    <Save size={16} className="mr-2" />
                                    Group {String.fromCharCode(65 + i)} を保存
                                </Button>
                            ))}
                        </Stack>
                    </Stack>
                </View>
            </Stack>
        </View>
    ) : (
        <View border="base" rounded="lg" padding="xl" className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-50/50 dark:bg-slate-900/10 border-dashed">
            <Dice5 size={48} className="mb-4 opacity-10 animate-pulse" />
            <Text weight="bold" className="opacity-40">実行をクリックすると検証結果を表示します。</Text>
            <Text variant="xs" className="opacity-30 mt-2">検証の結果がここにリアルタイムで解析されます。</Text>
        </View>
    );

    const verificationBlock =
        testResult ? (
            <Text color={testResult.p_value < 0.05 ? "success" : "warning"}>
                検証: p-value = {formatPValue(testResult.p_value)}
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
                    defaultName="simulation_result_data"
                />
            )}
        </>
    );
};
