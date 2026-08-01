"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { StatisticsApi, RegressionResult } from "@my-project/client-sdk";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Button } from "../../../design/baseComponents/Button";
import { Slider } from "../../../design/baseComponents/Slider";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { SaveVariableModal } from "../../variable-manager/ui/SaveVariableModal";
import { Save, Trash2, Zap, RefreshCw } from "lucide-react";

export const RegressionLab: React.FC = () => {
    const [sampleSize, setSampleSize] = useState(60);
    const [trueSlope, setTrueSlope] = useState(1.5);
    const [trueIntercept, setTrueIntercept] = useState(2.0);
    const [noiseStd, setNoiseStd] = useState(0.5);
    const [outlierCount, setOutlierCount] = useState(0);
    
    interface DataPoint { x: number; y: number; }
    const [data, setData] = useState<DataPoint[]>([]);
    const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [pendingSave, setPendingSave] = useState<{ value: string; kind: string } | null>(null);

    const generateData = useCallback(async () => {
        setBusy(true);
        try {
            // Generate X data (Uniform distribution for better spread in regression visual)
            // Use sampleNormal and transform it slightly or just use it as is
            const x = await StatisticsApi.sampleNormal(0, 1.5, sampleSize);
            
            // Calculate base Y = intercept + slope * x
            const yBase = Array.from(x).map(xv => trueIntercept + trueSlope * xv);
            let yArray = yBase;
            
            // Add Gaussian noise
            if (noiseStd > 0) {
                yArray = await StatisticsApi.addGaussianNoise(yArray, noiseStd);
            }
            
            // Add Outliers
            if (outlierCount > 0) {
                // Outliers in a wide range
                const minY = Math.min(...Array.from(yArray));
                const maxY = Math.max(...Array.from(yArray));
                yArray = await StatisticsApi.addOutliers(yArray, outlierCount, minY - 5, maxY + 5);
            }

            const points = Array.from(x).map((xv, i) => ({ x: xv, y: yArray[i] }));
            setData(points);

            // Run Simple Linear Regression
            const result = await StatisticsApi.runSimpleLinearRegression(x, yArray);
            setRegressionResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    }, [noiseStd, outlierCount, sampleSize, trueIntercept, trueSlope]);

    useEffect(() => {
        void generateData();
    }, [generateData]);

    const chartConfig = useMemo(() => {
        if (data.length === 0) return null;
        const xs = data.map(p => p.x);
        const ys = data.map(p => p.y);
        const minX = Math.min(...xs, -4);
        const maxX = Math.max(...xs, 4);
        const minY = Math.min(...ys, -4);
        const maxY = Math.max(...ys, 10);

        return { minX, maxX, minY, maxY, rangeX: maxX - minX, rangeY: maxY - minY };
    }, [data]);

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">回帰分析ラボ (Regression Lab)</Text>
            <Text color="secondary" variant="detail">
                母集団パラメータ（傾き、切片）を定義してデータを生成し、最小二乗法(OLS)による回帰直線の適合を体験します。
            </Text>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="lg">
            <Stack gap="sm">
                <Text weight="bold" className="flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" />
                    パラメータ設定
                </Text>
                <Text variant="xs" color="secondary">真の線形モデル $y = \beta_0 + \beta_1 x + \epsilon$ を定義します。</Text>
            </Stack>

            <Stack gap="md" className="p-4 rounded-xl bg-muted/50 border border-base">
                <Slider label="標本サイズ (N)" min={10} max={300} step={1} value={sampleSize} onChange={setSampleSize} />
                <Slider label="真の傾き (Slope)" min={-3} max={3} step={0.1} value={trueSlope} onChange={setTrueSlope} />
                <Slider label="真の切片 (Intercept)" min={-5} max={5} step={0.1} value={trueIntercept} onChange={setTrueIntercept} />
                <Slider label="観測ノイズ (Std Dev)" min={0} max={3} step={0.1} value={noiseStd} onChange={setNoiseStd} />
                <Slider label="外れ値の数 (Outliers)" min={0} max={10} step={1} value={outlierCount} onChange={setOutlierCount} />
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
            {regressionResult && (
                <Stack gap="md" className="p-5 rounded-xl border-2 border-brand-heart/20 bg-brand-heart/5">
                    <Text weight="bold" variant="body">推定結果 (Estimated Model)</Text>
                    <View className="grid grid-cols-2 gap-4">
                        <Stack gap="xs">
                            <Text variant="xs" color="secondary">推定傾き (b1)</Text>
                            <Text weight="bold" variant="h4" color="brand-heart">{regressionResult.slope.toFixed(4)}</Text>
                        </Stack>
                        <Stack gap="xs">
                            <Text variant="xs" color="secondary">推定切片 (b0)</Text>
                            <Text weight="bold" variant="h4">{regressionResult.intercept.toFixed(4)}</Text>
                        </Stack>
                        <Stack gap="xs" className="col-span-2">
                            <Text variant="xs" color="secondary">決定係数 (R²)</Text>
                            <Text weight="bold" variant="h4" color="success">{regressionResult.rSquared.toFixed(4)}</Text>
                        </Stack>
                    </View>
                    <View border="base" className="border-dashed opacity-20" />
                    <Text variant="xs" color="secondary" className="leading-relaxed">
                        決定係数 $R^2$ は、目的変数の分散のうちモデルで説明できる割合を示します。
                    </Text>
                </Stack>
            )}

            <View border="base" rounded="lg" bg="card" className="aspect-[16/10] relative flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-inner border-2">
                <View className="absolute inset-0 opacity-10 pointer-events-none">
                    <View className="absolute top-1/2 left-0 w-full h-px bg-slate-500" />
                    <View className="absolute left-1/2 top-0 w-px h-full bg-slate-500" />
                </View>

                {chartConfig && data.map((p, i) => {
                    const left = ((p.x - chartConfig.minX) / chartConfig.rangeX) * 100;
                    const bottom = ((p.y - chartConfig.minY) / chartConfig.rangeY) * 100;
                    if (left < 0 || left > 100 || bottom < 0 || bottom > 100) return null;
                    return (
                        <View
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-brand-heart/40 hover:bg-brand-heart hover:scale-150 transition-all cursor-crosshair"
                            style={{ left: `${left}%`, bottom: `${bottom}%` }}
                        />
                    );
                })}

                {regressionResult && chartConfig && (() => {
                    const slope = regressionResult.slope;
                    const intercept = regressionResult.intercept;

                    const xStart = chartConfig.minX;
                    const yStart = intercept + slope * xStart;
                    const xEnd = chartConfig.maxX;
                    const yEnd = intercept + slope * xEnd;

                    const startL = 0;
                    const startB = ((yStart - chartConfig.minY) / chartConfig.rangeY) * 100;
                    const endL = 100;
                    const endB = ((yEnd - chartConfig.minY) / chartConfig.rangeY) * 100;

                    return (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                            <line
                                x1={`${startL}%`}
                                y1={`${100 - startB}%`}
                                x2={`${endL}%`}
                                y2={`${100 - endB}%`}
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-brand-heart opacity-60"
                                strokeDasharray="4"
                            />
                        </svg>
                    );
                })()}

                <Text variant="xs" className="absolute bottom-4 right-4 bg-card/80 px-2 py-1 rounded border">Regression Plot (N={data.length})</Text>
            </View>

            <Stack direction="row" gap="sm" className="justify-end px-2">
                 <Button variant="ghost" size="sm" onClick={() => { setData([]); setRegressionResult(null); }} color="secondary">
                    <Trash2 size={16} className="mr-2" />
                    表示をクリア
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPendingSave({
                    value: JSON.stringify({
                        slope: regressionResult?.slope,
                        intercept: regressionResult?.intercept,
                        r_squared: regressionResult?.rSquared,
                    }),
                    kind: "statistics.regression_model"
                })}>
                    <Save size={16} className="mr-2" />
                    モデルを変数として保存
                </Button>
            </Stack>
        </Stack>
    );

    const verificationBlock =
        regressionResult ? (
            <Text color="muted">検証: R² = {regressionResult.rSquared.toFixed(4)}</Text>
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
                    defaultName="linear_regression_model"
                />
            )}
        </>
    );
};
