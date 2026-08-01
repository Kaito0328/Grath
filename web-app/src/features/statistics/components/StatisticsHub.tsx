"use client";

import React from "react";
import { Stack } from "../../../design/primitives/Stack";
import { View } from "../../../design/primitives/View";
import { Text } from "../../../design/baseComponents/Text";
import { Button } from "../../../design/baseComponents/Button";
import { UnaryOperationLayout } from "../../../shared/layouts/UnaryOperationLayout";
import { VariableManagerPanel } from "../../../shared/variable-manager/VariableManagerPanel";
import { routes } from "../../../config/routes";
import { TrendingUp, BarChart2, ArrowRight, Zap, Activity } from "lucide-react";
import Link from "next/link";

export const StatisticsHub: React.FC = () => {
    const tools = [
        {
            title: "統計ワークショップ (Workshop)",
            description: "サンプリングからノイズ注入、検定までの実験一連の流れを体験します。",
            href: routes.statistics.workshop,
            icon: <Zap className="text-amber-500" size={32} />,
            color: "border-amber-500/30"
        },
        {
            title: "仮説検定 (Hypothesis Testing)",
            description: "t検定, ANOVA, カイ二乗検定などの統計的仮説検定を実行します。",
            href: routes.statistics.testing,
            icon: <TrendingUp className="text-brand-primary" size={32} />,
            color: "border-blue-500/30"
        },
        {
            title: "確率分布 (Distributions)",
            description: "様々な確率理論に基づいた分布のシミュレートと可視化を行います。",
            href: routes.statistics.distributions,
            icon: <BarChart2 className="text-brand-heart" size={32} />,
            color: "border-rose-500/30"
        },
        {
            title: "相関分析ラボ (Correlation Lab)",
            description: "2つの変数間の線形関係を視覚化し、相関の強さと有意性を分析します。",
            href: routes.statistics.correlation,
            icon: <Activity className="text-emerald-500" size={32} />,
            color: "border-emerald-500/30"
        },
        {
            title: "適合度検定ラボ (GoF Lab)",
            description: "カイ二乗検定を用いて、標本データが理論分布に従っているかを検証します。",
            href: routes.statistics.gof,
            icon: <BarChart2 className="text-indigo-500" size={32} />,
            color: "border-indigo-500/30"
        },
        {
            title: "回帰分析ラボ (Regression Lab)",
            description: "最小二乗法を用いて変数間の線形モデルを構築し、予測と統計的な評価を行います。",
            href: routes.statistics.regression,
            icon: <Zap className="text-brand-heart" size={32} />,
            color: "border-brand-heart/30"
        }
    ];

    const settingBlock = (
        <Stack gap="sm">
            <Text weight="semibold" variant="detail">統計解析ツールハブ</Text>
            <Text color="secondary" variant="detail">
                仮説検定、分布シミュレーション、相関・回帰分析などの統計機能へアクセスし、生成データを統合管理します。
            </Text>
        </Stack>
    );

    const inputBlock = (
        <Stack gap="md">
            <Text weight="bold" variant="body">統計解析ツール</Text>
            <View className="grid md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                    <Link href={tool.href} key={tool.title} className="group">
                        <View
                            border="base"
                            bg="card"
                            rounded="lg"
                            padding="lg"
                            className={`h-full transition-all hover:shadow-lg hover:-translate-y-1 border-slate-200 dark:border-slate-800 ${tool.color}`}
                        >
                            <Stack gap="md">
                                <Stack direction="row" className="justify-between items-start">
                                    <View bg="muted" padding="md" rounded="lg">
                                        {tool.icon}
                                    </View>
                                    <ArrowRight className="text-slate-300 group-hover:text-brand-primary transition-colors" size={24} />
                                </Stack>
                                <Stack gap="xs">
                                    <Text variant="h3" weight="bold">{tool.title}</Text>
                                    <Text color="secondary" variant="detail">{tool.description}</Text>
                                </Stack>
                                <Button variant="ghost" size="sm" className="w-fit p-0 h-auto font-bold text-brand-primary">
                                    ツールを開く
                                </Button>
                            </Stack>
                        </View>
                    </Link>
                ))}
            </View>
        </Stack>
    );

    const outputBlock = (
        <Stack gap="md">
            <Text weight="bold" variant="body">統計変数マネージャー</Text>
            <View border="base" bg="card" rounded="lg" padding="lg" className="border-slate-200 dark:border-slate-800">
                <VariableManagerPanel showHeader={false} />
            </View>
        </Stack>
    );

    return (
        <UnaryOperationLayout
            setting={settingBlock}
            input={inputBlock}
            output={outputBlock}
            verification={<Text color="muted">利用可能ツール数: {tools.length}</Text>}
        />
    );
};
