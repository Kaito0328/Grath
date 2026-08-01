"use client";

import React, { useState, useMemo } from "react";
import { StatisticsApi, DescriptiveStats, TestResult } from "@my-project/client-sdk";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Button } from "../../../design/baseComponents/Button";
import { IconButton } from "../../../design/baseComponents/IconButton";
import { Select } from "../../../design/baseComponents/Select";
import { Input } from "../../../design/baseComponents/Input";
import { TextArea } from "../../../design/baseComponents/TextArea";
import { Switch } from "../../../design/baseComponents/Switch";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import { useVariableManagerStore } from "../../../stores/variableManager/store";
import { SAMPLE_DATA_SETS } from "../constants/sampleData";
import { Save, Plus, Trash2, Play } from "lucide-react";

export const HypothesisTestingWizard: React.FC = () => {
    // States for Analysis
    const [testType, setTestType] = useState<string>("one-sample-t");
    const [directInput, setDirectInput] = useState<string>("1, 2, 3, 4, 5");
    const [multiGroupData, setMultiGroupData] = useState<string[]>(["10, 11, 12", "15, 14, 16"]);
    const [matrixData, setMatrixData] = useState<string>("10, 20\n30, 40");
    const [mu0, setMu0] = useState<number>(0);
    const [pooled, setPooled] = useState<boolean>(false);

    const [stats, setStats] = useState<DescriptiveStats | null>(null);
    const [testResult, setTestResult] = useState<TestResult | null>(null);

    const [pendingSave, setPendingSave] = useState<{ value: string; kind: string } | null>(null);
    const [busy, setBusy] = useState(false);

    const entries = useVariableManagerStore(s => s.entries);
    const sampleVariables = useMemo(() => entries.filter(e => e.kind === "statistics.sample"), [entries]);

    const parseData = (s: string): number[] => {
        return s.split(/[\s,]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
    };

    const handleCalculate = async () => {
        const data = parseData(directInput);
        if (data.length === 0) return;
        setBusy(true);
        try {
            const res = await StatisticsApi.getDescriptiveStats(data);
            setStats(res);
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    };

    const handleRunTest = async () => {
        setBusy(true);
        try {
            let res: TestResult;
            if (testType === "one-sample-t") {
                res = await StatisticsApi.runOneSampleTTest(parseData(directInput), mu0);
            } else if (testType === "two-sample-t") {
                const x = parseData(multiGroupData[0] || "");
                const y = parseData(multiGroupData[1] || "");
                res = await StatisticsApi.runTwoSampleTTest(x, y, pooled);
            } else if (testType === "anova") {
                const groups = multiGroupData.map(parseData).filter(g => g.length > 0);
                res = await StatisticsApi.runOneWayAnova(groups);
            } else if (testType === "chisq-independence") {
                const table = matrixData.split("\n").map(line =>
                    line.split(/[\s,]+/).map(v => parseInt(v)).filter(v => !isNaN(v))
                ).filter(row => row.length > 0);
                res = await StatisticsApi.runChisqIndependence(table as number[][]);
            } else return;
            setTestResult(res);
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setBusy(false);
        }
    };

    const variableOptions = useMemo(() => [
        { label: "(変数からロード)", value: "" },
        ...sampleVariables.map(v => ({ label: v.name, value: v.id }))
    ], [sampleVariables]);

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">仮説検定ウィザード (Hypothesis Testing Wizard)</Text>
            <Text color="secondary" variant="detail">
                検定手法を選び、入力データを設定して、基本統計量と検定結果を段階的に確認します。
            </Text>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="lg">
            <View border="base" rounded="lg" padding="lg" bg="card" className="shadow-sm">
                <Stack gap="md">
                    <Text weight="bold" variant="body">検定の設定 (Settings)</Text>
                    <Stack gap="sm">
                        <Text variant="detail" color="secondary">検定手法を選択してください</Text>
                        <Stack direction="row" gap="sm" className="flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                            {[
                                { value: "one-sample-t", label: "1標本 t検定" },
                                { value: "two-sample-t", label: "2標本 t検定" },
                                { value: "anova", label: "ANOVA (分散分析)" },
                                { value: "chisq-independence", label: "カイ二乗検定" },
                            ].map((t) => (
                                <Button
                                    key={t.value}
                                    variant={testType === t.value ? "solid" : "ghost"}
                                    size="sm"
                                    onClick={() => setTestType(t.value)}
                                    className={testType === t.value ? "shadow-md bg-white text-slate-800" : "text-slate-500"}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </Stack>
                    </Stack>
                    {testType === "one-sample-t" && (
                        <Stack gap="sm" className="w-48">
                            <Text variant="detail">期待値 (μ0)</Text>
                            <Input type="number" value={mu0} onChange={(e) => setMu0(parseFloat(e.target.value))} />
                        </Stack>
                    )}
                    {testType === "two-sample-t" && (
                        <Stack direction="row" gap="md" className="items-center">
                            <Switch checked={pooled} onChange={(e) => setPooled(e.target.checked)} />
                            <Text variant="xs" color="secondary">等分散を仮定 (Pooled Variance)</Text>
                        </Stack>
                    )}
                </Stack>
            </View>

            <View border="base" rounded="lg" padding="lg" bg="card" className="shadow-sm">
                <Stack gap="md">
                    <Text weight="bold" variant="body">データの入力 (Input)</Text>
                    {testType === "one-sample-t" ? (
                        <Stack gap="md">
                            <Stack gap="sm">
                                <Stack direction="row" className="justify-between items-center">
                                    <Text variant="detail">標本データ (カンマ・空白区切り)</Text>
                                    {sampleVariables.length > 0 && (
                                        <Select
                                            className="w-48 h-8 text-xs py-0"
                                            onChange={(e) => {
                                                const v = sampleVariables.find((entry) => entry.id === e.target.value);
                                                if (v) setDirectInput(v.value);
                                            }}
                                            value=""
                                            options={variableOptions}
                                        />
                                    )}
                                </Stack>
                                <TextArea
                                    value={directInput}
                                    onChange={(e) => setDirectInput(e.target.value)}
                                    rows={4}
                                    placeholder="例: 1.2, 3.4, 5.6..."
                                    className="font-mono bg-slate-50 dark:bg-slate-950/50"
                                />
                                <Stack direction="row" gap="xs" className="flex-wrap">
                                    <Text variant="xs" color="secondary" className="mr-2 self-center">サンプル:</Text>
                                    {SAMPLE_DATA_SETS.map((s) => (
                                        <Button key={s.name} size="sm" variant="outline" onClick={() => setDirectInput(s.data.join(", "))}>
                                            {s.name}
                                        </Button>
                                    ))}
                                </Stack>
                            </Stack>
                        </Stack>
                    ) : (testType === "two-sample-t" || testType === "anova") ? (
                        <Stack gap="lg">
                            <View className="grid md:grid-cols-2 gap-4">
                                {multiGroupData.map((d, i) => (
                                    <Stack key={i} gap="sm" className="bg-slate-50 dark:bg-slate-900 /20 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <Stack direction="row" className="justify-between items-center">
                                            <Text variant="detail" weight="semibold">グループ {i + 1}</Text>
                                            <Stack direction="row" gap="xs">
                                                {sampleVariables.length > 0 && (
                                                    <Select
                                                        className="w-24 h-7 text-[10px] py-0"
                                                        onChange={(e) => {
                                                            const v = sampleVariables.find((entry) => entry.id === e.target.value);
                                                            if (v) {
                                                                const next = [...multiGroupData];
                                                                next[i] = v.value;
                                                                setMultiGroupData(next);
                                                            }
                                                        }}
                                                        value=""
                                                        options={variableOptions}
                                                    />
                                                )}
                                                {multiGroupData.length > 2 && (
                                                    <IconButton size="sm" onClick={() => setMultiGroupData(multiGroupData.filter((_, idx) => idx !== i))} color="danger">
                                                        <Trash2 size={14} />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </Stack>
                                        <TextArea
                                            value={d}
                                            onChange={(e) => {
                                                const next = [...multiGroupData];
                                                next[i] = e.target.value;
                                                setMultiGroupData(next);
                                            }}
                                            rows={3}
                                            className="font-mono text-sm"
                                        />
                                    </Stack>
                                ))}
                            </View>
                            {testType === "anova" && (
                                <Button variant="outline" size="sm" onClick={() => setMultiGroupData([...multiGroupData, ""])} className="w-32 border-dashed">
                                    <Plus size={16} className="mr-1" /> グループ追加
                                </Button>
                            )}
                        </Stack>
                    ) : (
                        <Stack gap="md">
                            <Text variant="detail">分割表 (行: カンマ区切り, 列: 換行)</Text>
                            <TextArea
                                value={matrixData}
                                onChange={(e) => setMatrixData(e.target.value)}
                                rows={4}
                                placeholder="10, 20&#10;30, 40"
                                className="font-mono bg-slate-50 dark:bg-slate-950/50"
                            />
                        </Stack>
                    )}
                </Stack>
            </View>
        </Stack>
    );

    const actionBlock = (
        <View border="base" rounded="lg" padding="lg" bg="card" className="shadow-sm border-2 border-slate-200 dark:border-slate-700">
            <Stack gap="md" className="items-center">
                <Text weight="bold" variant="body">実行 (Execution)</Text>
                <Stack direction="row" gap="lg" className="justify-center w-full">
                    <Button
                        onClick={handleRunTest}
                        color="primary"
                        size="lg"
                        loading={busy}
                        className="w-full max-w-xs text-lg font-bold shadow-lg"
                    >
                        <Play size={20} className="mr-2 fill-white" />
                        検定を実行
                    </Button>
                    {testType === "one-sample-t" && (
                        <Button
                            onClick={handleCalculate}
                            variant="outline"
                            size="lg"
                            loading={busy}
                            className="w-full max-w-xs"
                        >
                            基本統計量のみ
                        </Button>
                    )}
                </Stack>
                <Stack direction="row" gap="sm">
                    <IconButton
                        variant="ghost"
                        onClick={() => setPendingSave({ value: testType === "one-sample-t" ? directInput : JSON.stringify(multiGroupData), kind: "statistics.sample" })}
                        title="入力を変数として保存"
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <Save size={20} />
                    </IconButton>
                </Stack>
            </Stack>
        </View>
    );

    const outputBlock =
        stats || testResult ? (
            <Stack gap="lg">
                {stats && (
                    <View border="base" rounded="lg" padding="lg" bg="card" className="shadow-sm overflow-hidden border-slate-200 dark:border-slate-800">
                        <Stack gap="md">
                            <Text weight="bold" variant="body">基本統計量 (Descriptive Statistics)</Text>
                            <View className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(stats).map(([k, v]) => (
                                    <View key={k} bg="muted" rounded="lg" padding="md" className="border border-slate-100 dark:border-slate-900">
                                        <Text variant="detail" className="uppercase text-[10px] tracking-wider mb-1" color="secondary">{k.replace("_", " ")}</Text>
                                        <Text variant="h3" className="font-mono text-slate-900 dark:text-slate-100">{typeof v === "number" ? v.toFixed(4) : v}</Text>
                                    </View>
                                ))}
                            </View>
                        </Stack>
                    </View>
                )}

                {testResult && (
                    <View border="base" rounded="lg" padding="xl" bg="card" className="relative group shadow-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/40 backdrop-blur-sm">
                        <IconButton
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setPendingSave({ value: JSON.stringify(testResult), kind: "statistics.result" })}
                            title="結果を変数として保存"
                        >
                            <Save size={18} />
                        </IconButton>
                        <Stack gap="lg">
                            <Stack gap="xs">
                                <Text weight="bold" variant="body">検定結果 (Test Results)</Text>
                                <Stack direction="row" className="justify-between items-end mt-2">
                                    <Text variant="h2" weight="bold">{testResult.method}</Text>
                                    <View
                                        padding="xs"
                                        rounded="full"
                                        bg={testResult.p_value < 0.05 ? "danger" : "muted"}
                                        className={`px-4 py-1 border-2 ${testResult.p_value < 0.05 ? "border-brand-danger/50" : "border-slate-200 dark:border-slate-800"}`}
                                    >
                                        <Text weight="bold" variant="xs" className={testResult.p_value < 0.05 ? "text-white" : "text-slate-400"}>
                                            {testResult.p_value < 0.05 ? "有意な差あり (Significant)" : "有意な差なし (Not Significant)"}
                                        </Text>
                                    </View>
                                </Stack>
                            </Stack>

                            <View className="grid grid-cols-2 sm:grid-cols-3 gap-8 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-900">
                                <Stack gap="xs">
                                    <Text variant="detail" color="secondary">検定統計量 (Stat)</Text>
                                    <Text variant="h1" className="font-mono">{testResult.stat.toFixed(4)}</Text>
                                </Stack>
                                <Stack gap="xs">
                                    <Text variant="detail" color="secondary">P値 (p-value)</Text>
                                    <Text variant="h1" className={`font-mono ${testResult.p_value < 0.05 ? "text-brand-danger" : ""}`}>
                                        {testResult.p_value.toFixed(6)}
                                    </Text>
                                </Stack>
                                {testResult.df1 !== undefined && (
                                    <Stack gap="xs">
                                        <Text variant="detail" color="secondary">自由度 (df)</Text>
                                        <Text variant="h1" className="font-mono">
                                            {testResult.df2 !== undefined ? `${testResult.df1.toFixed(1)}, ${testResult.df2.toFixed(1)}` : testResult.df1.toFixed(1)}
                                        </Text>
                                    </Stack>
                                )}
                            </View>

                            {(testResult.ci_lower !== undefined || testResult.effect !== undefined) && (
                                <View className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t dark:border-slate-800 pt-6">
                                    {testResult.ci_lower !== undefined && (
                                        <Stack gap="xs">
                                            <Text variant="detail" color="secondary">95% 信頼区間 (Confidence Interval)</Text>
                                            <Text className="font-mono text-lg text-slate-700 dark:text-slate-300">
                                                [{testResult.ci_lower.toFixed(4)}, {testResult.ci_upper?.toFixed(4)}]
                                            </Text>
                                        </Stack>
                                    )}
                                    {testResult.effect !== undefined && (
                                        <Stack gap="xs">
                                            <Text variant="detail" color="secondary">効果量 (Effect Size)</Text>
                                            <Text className="font-mono text-lg text-slate-700 dark:text-slate-300">
                                                {testResult.effect.toFixed(4)}
                                            </Text>
                                        </Stack>
                                    )}
                                </View>
                            )}
                        </Stack>
                    </View>
                )}
            </Stack>
        ) : (
            <Text color="secondary">実行後に基本統計量と検定結果を表示します。</Text>
        );

    const verificationBlock =
        testResult ? (
            <Text color={testResult.p_value < 0.05 ? "success" : "warning"}>
                検証: p-value = {testResult.p_value.toFixed(6)}
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
                    defaultName="sample_data"
                />
            )}
        </>
    );
};
